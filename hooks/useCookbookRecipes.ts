"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthProvider";
import type { CookbookRecipe } from "@/types/cookbook";

type AddRecipeInput =
  | { type: "meal"; idMeal: string; strMeal: string; strMealThumb: string }
  | { type: "custom"; name: string; ingredients: string[]; instructions: string; imageUrl?: string };

export function useCookbookRecipes(cookbookId: string) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<CookbookRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cookbookId) { setRecipes([]); setIsLoading(false); return; }
    let active = true;
    setIsLoading(true);
    const q = query(collection(db, "cookbookRecipes"), where("cookbookId", "==", cookbookId), orderBy("addedAt", "desc"));
    const unsub = onSnapshot(q, async (snapshot) => {
      try {
        const list: CookbookRecipe[] = [];
        const userIds = new Set<string>();
        snapshot.docs.forEach((d) => {
          const data = d.data();
          list.push({ id: d.id, ...data } as CookbookRecipe);
          if (data.addedBy) userIds.add(data.addedBy);
        });
        const nameMap = new Map<string, string>();
        await Promise.all(Array.from(userIds).map(async (uid) => {
          try {
            const ud = await getDoc(doc(db, "users", uid));
            nameMap.set(uid, ud.exists() ? (ud.data().displayName || "Anonymous") : "Anonymous");
          } catch (e) { console.error("useCookbookRecipes author fetch error:", e); nameMap.set(uid, "Anonymous"); }
        }));
        if (!active) return;
        setRecipes(list.map((r) => ({ ...r, authorName: nameMap.get(r.addedBy) || "Anonymous" })));
      } catch (e) { console.error("useCookbookRecipes snapshot error:", e); }
      if (active) setIsLoading(false);
    });
    return () => { active = false; unsub(); };
  }, [cookbookId]);

  const addRecipe = useCallback(async (input: AddRecipeInput) => {
    if (!user) return;
    const base = { cookbookId, addedBy: user.uid, likes: [], addedAt: Date.now() };
    const data = input.type === "meal"
      ? { ...base, type: "meal", idMeal: input.idMeal, strMeal: input.strMeal, strMealThumb: input.strMealThumb }
      : { ...base, type: "custom", name: input.name, ingredients: input.ingredients, instructions: input.instructions, imageUrl: input.imageUrl || undefined };
    await addDoc(collection(db, "cookbookRecipes"), data);
  }, [cookbookId, user]);

  const removeRecipe = useCallback(async (recipeId: string) => {
    if (!user) return;
    const ref = doc(db, "cookbookRecipes", recipeId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().addedBy !== user.uid) return;
    await deleteDoc(ref);
  }, [user]);

  const toggleLike = useCallback(async (recipeId: string) => {
    if (!user) return;
    const ref = doc(db, "cookbookRecipes", recipeId);
    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) return;
        const likes = (snap.data().likes || []) as string[];
        if (likes.includes(user.uid)) {
          transaction.update(ref, { likes: arrayRemove(user.uid) });
        } else {
          transaction.update(ref, { likes: arrayUnion(user.uid) });
        }
      });
    } catch (e) { console.error("toggleLike error:", e); }
  }, [user]);

  return { recipes, isLoading, addRecipe, removeRecipe, toggleLike };
}
