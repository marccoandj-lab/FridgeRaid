"use client";

import { useState, useCallback, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, getDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthProvider";
import type { Cookbook, CookbookWithMeta } from "@/types/cookbook";

const INVITE_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const INVITE_CODE_LENGTH = 8;
const MAX_INVITE_ATTEMPTS = 5;
const FIRESTORE_IN_LIMIT = 10;

function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_CHARS.charAt(Math.floor(Math.random() * INVITE_CODE_CHARS.length));
  }
  return code;
}

export function useCookbooks() {
  const { user } = useAuth();
  const [cookbooks, setCookbooks] = useState<CookbookWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCookbooks = useCallback(async () => {
    if (!user) { setCookbooks([]); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const [owned, membered] = await Promise.all([
        getDocs(query(collection(db, "cookbooks"), where("ownerId", "==", user.uid))),
        getDocs(query(collection(db, "cookbookMembers"), where("userId", "==", user.uid))),
      ]);
      const memberIds = membered.docs.map((d) => d.data().cookbookId);
      const allIds = Array.from(new Set([...owned.docs.map((d) => d.id), ...memberIds]));

      if (allIds.length === 0) {
        setCookbooks([]);
        setIsLoading(false);
        return;
      }

      const ownedMap = new Map(owned.docs.map((d) => [d.id, d]));
      const missingIds = allIds.filter((id) => !ownedMap.has(id));
      const memberSnaps = await Promise.all(missingIds.map((id) => getDoc(doc(db, "cookbooks", id))));
      const memberSnapsMap = new Map(memberSnaps.filter((s) => s.exists()).map((s) => [s.id, s]));

      const recipeCount = new Map<string, number>();
      const memberCount = new Map<string, Set<string>>();

      for (let i = 0; i < allIds.length; i += FIRESTORE_IN_LIMIT) {
        const chunk = allIds.slice(i, i + FIRESTORE_IN_LIMIT);
        const [recipeSnaps, memberSnapsBatch] = await Promise.all([
          getDocs(query(collection(db, "cookbookRecipes"), where("cookbookId", "in", chunk))),
          getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "in", chunk))),
        ]);
        for (const d of recipeSnaps.docs) {
          const cid = d.data().cookbookId;
          recipeCount.set(cid, (recipeCount.get(cid) || 0) + 1);
        }
        for (const d of memberSnapsBatch.docs) {
          const cid = d.data().cookbookId;
          if (!memberCount.has(cid)) memberCount.set(cid, new Set());
          memberCount.get(cid)!.add(d.data().userId);
        }
      }

      const results: CookbookWithMeta[] = [];
      for (const id of allIds) {
        const snap = ownedMap.get(id) || memberSnapsMap.get(id);
        if (!snap || !snap.exists()) continue;
        const data = snap.data() as Omit<Cookbook, "id">;
        results.push({ id: snap.id, ...data, memberCount: memberCount.get(id)?.size || 1, recipeCount: recipeCount.get(id) || 0 });
      }
      results.sort((a, b) => b.createdAt - a.createdAt);
      setCookbooks(results);
    } catch (e) { console.error("fetchCookbooks failed:", e); } finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchCookbooks(); }, [fetchCookbooks]);

  const createCookbook = useCallback(async (name: string): Promise<string | null> => {
    if (!user) return null;
    try {
      let code = generateInviteCode();
      for (let attempt = 0; attempt < MAX_INVITE_ATTEMPTS; attempt++) {
        const existing = await getDocs(query(collection(db, "cookbooks"), where("inviteCode", "==", code)));
        if (existing.empty) break;
        code = generateInviteCode();
      }
      const ref = await addDoc(collection(db, "cookbooks"), { name, ownerId: user.uid, inviteCode: code, createdAt: Date.now() });
      await addDoc(collection(db, "cookbookMembers"), { cookbookId: ref.id, userId: user.uid, joinedAt: Date.now() });
      await fetchCookbooks();
      return ref.id;
    } catch (e) { console.error("createCookbook failed:", e); return null; }
  }, [user, fetchCookbooks]);

  const joinCookbook = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const snap = await getDocs(query(collection(db, "cookbooks"), where("inviteCode", "==", code.toUpperCase())));
      if (snap.empty) return false;
      const cid = snap.docs[0].id;
      const memberCheck = await getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "==", cid), where("userId", "==", user.uid)));
      if (memberCheck.empty) await addDoc(collection(db, "cookbookMembers"), { cookbookId: cid, userId: user.uid, joinedAt: Date.now() });
      await fetchCookbooks();
      return true;
    } catch (e) { console.error("joinCookbook failed:", e); return false; }
  }, [user, fetchCookbooks]);

  const deleteCookbook = useCallback(async (cookbookId: string) => {
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, "cookbooks", cookbookId));
      if (!snap.exists() || snap.data().ownerId !== user.uid) return;
      const batch = writeBatch(db);
      batch.delete(doc(db, "cookbooks", cookbookId));
      const [ms, rs] = await Promise.all([
        getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "==", cookbookId))),
        getDocs(query(collection(db, "cookbookRecipes"), where("cookbookId", "==", cookbookId))),
      ]);
      ms.docs.forEach((d) => batch.delete(d.ref));
      rs.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      await fetchCookbooks();
    } catch (e) { console.error("deleteCookbook failed:", e); }
  }, [user, fetchCookbooks]);

  return { cookbooks, isLoading, createCookbook, joinCookbook, deleteCookbook, refetch: fetchCookbooks };
}
