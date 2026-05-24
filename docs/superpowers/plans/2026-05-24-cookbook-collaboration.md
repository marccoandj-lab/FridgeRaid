# Cookbook Collaboration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add collaborative cookbooks with custom recipes, invite codes, and liking.

**Architecture:** Flat Firestore collections (`cookbooks`, `cookbookMembers`, `cookbookRecipes`) accessed via hooks. Three new pages under `/cookbooks`.

**Tech Stack:** Next.js 16, Firebase Auth + Firestore, Tailwind CSS v4, shadcn/ui, Framer Motion, TheMealDB API

---

### Task 1: Firebase Firestore Init & Types

**Files:**
- Modify: `lib/firebase.ts`
- Create: `types/cookbook.ts`

- [ ] **Step 1: Add Firestore to firebase.ts**

Add `import { getFirestore } from "firebase/firestore"` and export `db`.

Expected final additions to `lib/firebase.ts`:
- Add import line: `import { getFirestore } from "firebase/firestore";`
- Add export: `export const db = getFirestore(app);`

- [ ] **Step 2: Create types/cookbook.ts**

Contains: `Cookbook`, `CookbookMember`, `CookbookRecipe`, `CookbookWithMeta` interfaces (see spec doc for full definitions).

- [ ] **Step 3: Commit**
```bash
git add lib/firebase.ts types/cookbook.ts
git commit -m "feat: add firestore init and cookbook types"
```

---

### Task 2: useCookbooks Hook

**Files:**
- Create: `hooks/useCookbooks.ts`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, addDoc, getDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthProvider";
import type { Cookbook, CookbookWithMeta } from "@/types/cookbook";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export function useCookbooks() {
  const { user } = useAuth();
  const [cookbooks, setCookbooks] = useState<CookbookWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCookbooks = useCallback(async () => {
    if (!user) { setCookbooks([]); setIsLoading(false); return; }
    try {
      const [owned, membered, allRecipes] = await Promise.all([
        getDocs(query(collection(db, "cookbooks"), where("ownerId", "==", user.uid))),
        getDocs(query(collection(db, "cookbookMembers"), where("userId", "==", user.uid))),
        getDocs(collection(db, "cookbookRecipes")),
      ]);
      const memberIds = membered.docs.map((d) => d.data().cookbookId);
      const allIds = new Set([...owned.docs.map((d) => d.id), ...memberIds]);
      const recipeCount = new Map<string, number>();
      allRecipes.docs.forEach((d) => { const cid = d.data().cookbookId; recipeCount.set(cid, (recipeCount.get(cid) || 0) + 1); });
      const memberDocs = await getDocs(collection(db, "cookbookMembers"));
      const memberCount = new Map<string, Set<string>>();
      memberDocs.docs.forEach((d) => {
        const cid = d.data().cookbookId;
        if (!memberCount.has(cid)) memberCount.set(cid, new Set());
        memberCount.get(cid)!.add(d.data().userId);
      });
      const results = (await Promise.all(Array.from(allIds).map(async (id) => {
        const snap = await getDoc(doc(db, "cookbooks", id));
        if (!snap.exists()) return null;
        const data = snap.data() as Omit<Cookbook, "id">;
        return { id: snap.id, ...data, memberCount: memberCount.get(id)?.size || 1, recipeCount: recipeCount.get(id) || 0 } as CookbookWithMeta;
      }))).filter(Boolean) as CookbookWithMeta[];
      results.sort((a, b) => b.createdAt - a.createdAt);
      setCookbooks(results);
    } catch {} finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchCookbooks(); }, [fetchCookbooks]);

  const createCookbook = useCallback(async (name: string): Promise<string | null> => {
    if (!user) return null;
    let code = generateInviteCode();
    const existing = await getDocs(query(collection(db, "cookbooks"), where("inviteCode", "==", code)));
    if (!existing.empty) code = generateInviteCode();
    const ref = await addDoc(collection(db, "cookbooks"), { name, ownerId: user.uid, inviteCode: code, createdAt: Date.now() });
    await addDoc(collection(db, "cookbookMembers"), { cookbookId: ref.id, userId: user.uid, joinedAt: Date.now() });
    await fetchCookbooks();
    return ref.id;
  }, [user, fetchCookbooks]);

  const joinCookbook = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    const snap = await getDocs(query(collection(db, "cookbooks"), where("inviteCode", "==", code.toUpperCase())));
    if (snap.empty) return false;
    const cid = snap.docs[0].id;
    const memberCheck = await getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "==", cid), where("userId", "==", user.uid)));
    if (memberCheck.empty) await addDoc(collection(db, "cookbookMembers"), { cookbookId: cid, userId: user.uid, joinedAt: Date.now() });
    await fetchCookbooks();
    return true;
  }, [user, fetchCookbooks]);

  const deleteCookbook = useCallback(async (cookbookId: string) => {
    if (!user) return;
    const book = cookbooks.find((c) => c.id === cookbookId);
    if (!book || book.ownerId !== user.uid) return;
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
  }, [user, cookbooks, fetchCookbooks]);

  return { cookbooks, isLoading, createCookbook, joinCookbook, deleteCookbook, refetch: fetchCookbooks };
}
```

- [ ] **Step 2: Commit**
```bash
git add hooks/useCookbooks.ts
git commit -m "feat: add useCookbooks hook"
```

---

### Task 3: useCookbookRecipes Hook

**Files:**
- Create: `hooks/useCookbookRecipes.ts`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from "firebase/firestore";
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
    if (!cookbookId) return;
    const q = query(collection(db, "cookbookRecipes"), where("cookbookId", "==", cookbookId), orderBy("addedAt", "desc"));
    const unsub = onSnapshot(q, async (snapshot) => {
      const list: CookbookRecipe[] = [];
      const userIds = new Set<string>();
      snapshot.docs.forEach((d) => {
        const data = d.data();
        list.push({ id: d.id, ...data } as CookbookRecipe);
        if (data.addedBy) userIds.add(data.addedBy);
      });
      const nameMap = new Map<string, string>();
      await Promise.all(Array.from(userIds).map(async (uid) => {
        try { const ud = await getDoc(doc(db, "users", uid)); nameMap.set(uid, ud.exists() ? (ud.data().displayName || "Anonymous") : "Anonymous"); }
        catch { nameMap.set(uid, "Anonymous"); }
      }));
      setRecipes(list.map((r) => ({ ...r, authorName: nameMap.get(r.addedBy) || "Anonymous" })));
      setIsLoading(false);
    });
    return () => unsub();
  }, [cookbookId]);

  const addRecipe = useCallback(async (input: AddRecipeInput) => {
    if (!user) return;
    const base = { cookbookId, addedBy: user.uid, likes: [], addedAt: Date.now() };
    const data = input.type === "meal"
      ? { ...base, type: "meal", idMeal: input.idMeal, strMeal: input.strMeal, strMealThumb: input.strMealThumb }
      : { ...base, type: "custom", name: input.name, ingredients: input.ingredients, instructions: input.instructions, imageUrl: input.imageUrl || "" };
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
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const likes = (snap.data().likes || []) as string[];
    await updateDoc(ref, likes.includes(user.uid) ? { likes: arrayRemove(user.uid) } : { likes: arrayUnion(user.uid) });
  }, [user]);

  return { recipes, isLoading, addRecipe, removeRecipe, toggleLike };
}
```

- [ ] **Step 2: Commit**
```bash
git add hooks/useCookbookRecipes.ts
git commit -m "feat: add useCookbookRecipes hook with likes"
```

---

### Task 4: useCookbookMembers Hook

**Files:**
- Create: `hooks/useCookbookMembers.ts`

```typescript
"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CookbookMember } from "@/types/cookbook";

export function useCookbookMembers(cookbookId: string) {
  const [members, setMembers] = useState<(CookbookMember & { displayName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!cookbookId) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "cookbookMembers"), where("cookbookId", "==", cookbookId)));
        const list = await Promise.all(snap.docs.map(async (d) => {
          const data = d.data() as Omit<CookbookMember, "id">;
          let displayName = "Anonymous";
          try { const ud = await getDoc(doc(db, "users", data.userId)); if (ud.exists()) displayName = ud.data().displayName || "Anonymous"; } catch {}
          return { id: d.id, ...data, displayName };
        }));
        setMembers(list);
      } catch {} finally { setIsLoading(false); }
    })();
  }, [cookbookId]);
  return { members, isLoading };
}
```

- [ ] **Step 2: Commit**
```bash
git add hooks/useCookbookMembers.ts
git commit -m "feat: add useCookbookMembers hook"
```

---

### Task 5: UI Components

**Files:**
- Create: `components/CookbookCard.tsx`
- Create: `components/CookbookRecipeCard.tsx`
- Create: `components/CreateCookbookForm.tsx`
- Create: `components/JoinCookbookForm.tsx`
- Create: `components/CookbookMemberBadge.tsx`

Refer to the spec file for full component code. Each component is 30-60 lines.

- [ ] **Step 1-5: Create each component file** with the code from the spec
- [ ] **Step 6: Commit**
```bash
git add components/CookbookCard.tsx components/CookbookRecipeCard.tsx components/CreateCookbookForm.tsx components/JoinCookbookForm.tsx components/CookbookMemberBadge.tsx
git commit -m "feat: add cookbook UI components"
```

---

### Task 6: Cookbooks List Page

**Files:**
- Create: `app/cookbooks/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CookbookCard } from "@/components/CookbookCard";
import { CreateCookbookForm } from "@/components/CreateCookbookForm";
import { JoinCookbookForm } from "@/components/JoinCookbookForm";
import { useCookbooks } from "@/hooks/useCookbooks";
import { useAuth } from "@/lib/AuthProvider";
import { auth } from "@/lib/firebase";

export default function CookbooksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { cookbooks, isLoading, createCookbook, joinCookbook, deleteCookbook } = useCookbooks();

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.push("/auth");
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Cookbooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, share, and collaborate on recipe collections</p>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            {isLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-card ring-1 ring-foreground/5" />)}</div>
            ) : cookbooks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/20 bg-card/50 py-16 text-center">
                <BookOpen size={40} className="mb-3 text-amber-500/40" />
                <p className="font-heading text-lg font-bold text-foreground">No cookbooks yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create one or join with an invite code</p>
              </motion.div>
            ) : (
              <div className="space-y-3">{cookbooks.map((book, i) => <CookbookCard key={book.id} cookbook={book} isOwner={book.ownerId === user.uid} onDelete={deleteCookbook} index={i} />)}</div>
            )}
          </div>
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <CreateCookbookForm onSubmit={createCookbook} />
            <JoinCookbookForm onSubmit={joinCookbook} />
          </div>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add app/cookbooks/page.tsx
git commit -m "feat: add cookbooks list page"
```

---

### Task 7: Cookbook Detail Page

**Files:**
- Create: `app/cookbooks/[id]/page.tsx`

This page shows the cookbook header (name, member badges, invite code), filter pills (All/MealDB/Custom), recipe grid with like buttons, and a FAB to add recipes.

- [ ] **Step 1: Create the page** — see the spec for the full implementation. Key sections:
  - Back link + cookbook header with name, member badges, invite code (copyable)
  - Filter pills (All/MealDB/Custom)
  - Recipe grid using `CookbookRecipeCard` with `toggleLike` and `removeRecipe`
  - Fixed FAB "Add Recipe" button linking to `/cookbooks/[id]/add`
  - Uses `useCookbookRecipes(cookbookId)` and `useCookbookMembers(cookbookId)`
- [ ] **Step 2: Commit**
```bash
git add app/cookbooks/[id]/page.tsx
git commit -m "feat: add cookbook detail page with recipe grid"
```

---

### Task 8: Add Recipe Page

**Files:**
- Create: `app/cookbooks/[id]/add/page.tsx`

Two tabs: "From Meals" (TheMealDB search with debounced input) and "Custom Recipe" (form with name, ingredients, instructions, optional image URL).

- [ ] **Step 1: Create the page** — see the spec for full implementation. Key sections:
  - Back link to cookbook detail
  - Tab toggle: "Search Meals" and "Custom Recipe"
  - Search tab: debounced text input that fetches TheMealDB API, renders results as clickable cards
  - Custom tab: form with name, ingredients (textarea, one per line), instructions (textarea), image URL (optional)
  - On add: calls `addRecipe` from hook and redirects to cookbook detail
- [ ] **Step 2: Commit**
```bash
git add app/cookbooks/[id]/add/page.tsx
git commit -m "feat: add recipe page with meal search and custom form"
```

---

```;

### Task 9: Firestore Composite Index

**Files:**
- Firebase Console (manual step)

- [ ] **Step 1: Create composite index**

In the Firebase Console, navigate to Firestore > Indexes and create:
- Collection: `cookbookRecipes`
- Fields: `cookbookId` (Ascending), `addedAt` (Descending)

Required for the `orderBy("addedAt", "desc")` query.

---

### Task 10: Navigation

**Files:**
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Add Cookbooks link to Navbar**

Import `BookOpen` from lucide-react (or use an existing icon) and add a link between Favorites and Profile:

```tsx
<Link
  href="/cookbooks"
  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
>
  <BookOpen size={18} />
  <span className="hidden sm:inline">Cookbooks</span>
</Link>
```

- [ ] **Step 2: Commit**
```bash
git add components/Navbar.tsx
git commit -m "feat: add cookbooks link to navbar"
```
