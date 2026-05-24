"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CookbookMember } from "@/types/cookbook";

export function useCookbookMembers(cookbookId: string) {
  const [members, setMembers] = useState<(CookbookMember & { displayName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cookbookId) { setMembers([]); setIsLoading(false); return; }
    let active = true;
    setIsLoading(true);
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "==", cookbookId)));
        const list = await Promise.all(snap.docs.map(async (d) => {
          const data = d.data() as Omit<CookbookMember, "id">;
          let displayName = "Anonymous";
          try { const ud = await getDoc(doc(db, "users", data.userId)); if (ud.exists()) displayName = ud.data().displayName || "Anonymous"; } catch (e) { console.error("failed to fetch user:", e); }
          return { id: d.id, ...data, displayName };
        }));
        if (active) setMembers(list);
      } catch (e) { console.error("useCookbookMembers error:", e); } 
      if (active) setIsLoading(false);
    })();
    return () => { active = false; };
  }, [cookbookId]);

  return { members, isLoading };
}
