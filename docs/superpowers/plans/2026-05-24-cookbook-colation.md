
### Task 2: useCookbooks Hook

**Files:**
- Create: \hooks/useCookbooks.ts\

- [ ] **Step 1: Create the hook**

\\\	ypescript
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthProvider";
import type { Cookbook, CookbookMember, CookbookWithMeta } from "@/types/cookbook";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useCookbooks() {
  const { user } = useAuth();
  const [cookbooks, setCookbooks] = useState<CookbookWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCookbooks = useCallback(async () => {
    if (!user) {
      setCookbooks([]);
      setIsLoading(false);
      return;
    }
    try {
      const [ownedSnapshot, memberSnapshot, allRecipesSnapshot] = await Promise.all([
        getDocs(query(collection(db, "cookbooks"), where("ownerId", "==", user.uid))),
        getDocs(query(collection(db, "cookbookMembers"), where("userId", "==", user.uid))),
        getDocs(collection(db, "cookbookRecipes")),
      ]);

      const memberCookbookIds = memberSnapshot.docs.map((d) => d.data().cookbookId);
      const allCookbookIds = new Set([
        ...ownedSnapshot.docs.map((d) => d.id),
        ...memberCookbookIds,
      ]);

      const recipeCountMap = new Map<string, number>();
      const memberCountMap = new Map<string, Set<string>>();

      for (const d of allRecipesSnapshot.docs) {
        const cid = d.data().cookbookId;
        recipeCountMap.set(cid, (recipeCountMap.get(cid) || 0) + 1);
      }

      const memberDocs = await getDocs(collection(db, "cookbookMembers"));
      for (const d of memberDocs.docs) {
        const cid = d.data().cookbookId;
        if (!memberCountMap.has(cid)) memberCountMap.set(cid, new Set());
        memberCountMap.get(cid)!.add(d.data().userId);
      }

      const cookbookPromises = Array.from(allCookbookIds).map(async (id) => {
        const snap = await getDoc(doc(db, "cookbooks", id));
        if (!snap.exists()) return null;
        const data = snap.data() as Omit<Cookbook, "id">;
        return {
          id: snap.id,
          ...data,
          memberCount: memberCountMap.get(id)?.size || 1,
          recipeCount: recipeCountMap.get(id) || 0,
        } as CookbookWithMeta;
      });

      const results = (await Promise.all(cookbookPromises)).filter(Boolean) as CookbookWithMeta[];
      results.sort((a, b) => b.createdAt - a.createdAt);
      setCookbooks(results);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCookbooks();
  }, [fetchCookbooks]);

  const createCookbook = useCallback(
    async (name: string): Promise<string | null> => {
      if (!user) return null;
      let inviteCode = generateInviteCode();
      const existing = await getDocs(
        query(collection(db, "cookbooks"), where("inviteCode", "==", inviteCode))
      );
      if (!existing.empty) {
        inviteCode = generateInviteCode();
      }
      const docRef = await addDoc(collection(db, "cookbooks"), {
        name, ownerId: user.uid, inviteCode, createdAt: Date.now(),
      });
      await addDoc(collection(db, "cookbookMembers"), {
        cookbookId: docRef.id, userId: user.uid, joinedAt: Date.now(),
      });
      await fetchCookbooks();
      return docRef.id;
    },
    [user, fetchCookbooks]
  );

  const joinCookbook = useCallback(
    async (code: string): Promise<boolean> => {
      if (!user) return false;
      const q = query(collection(db, "cookbooks"), where("inviteCode", "==", code.toUpperCase()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return false;
      const cookbookDoc = snapshot.docs[0];
      const existingMember = await getDocs(
        query(collection(db, "cookbookMembers"), where("cookbookId", "==", cookbookDoc.id), where("userId", "==", user.uid))
      );
      if (!existingMember.empty) return true;
      await addDoc(collection(db, "cookbookMembers"), {
        cookbookId: cookbookDoc.id, userId: user.uid, joinedAt: Date.now(),
      });
      await fetchCookbooks();
      return true;
    },
    [user, fetchCookbooks]
  );

  const deleteCookbook = useCallback(
    async (cookbookId: string) => {
      if (!user) return;
      const book = cookbooks.find((c) => c.id === cookbookId);
      if (!book || book.ownerId !== user.uid) return;
      const batch = writeBatch(db);
      batch.delete(doc(db, "cookbooks", cookbookId));
      const [memberSnap, recipeSnap] = await Promise.all([
        getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "==", cookbookId))),
        getDocs(query(collection(db, "cookbookRecipes"), where("cookbookId", "==", cookbookId))),
      ]);
      memberSnap.docs.forEach((d) => batch.delete(d.ref));
      recipeSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      await fetchCookbooks();
    },
    [user, cookbooks, fetchCookbooks]
  );

  return { cookbooks, isLoading, createCookbook, joinCookbook, deleteCookbook, refetch: fetchCookbooks };
}
\\\

- [ ] **Step 2: Commit**
\\\ash
git add hooks/useCookbooks.ts
git commit -m "feat: add useCookbooks hook"
\\\

---
