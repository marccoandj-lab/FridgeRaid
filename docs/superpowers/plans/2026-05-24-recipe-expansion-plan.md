# Massive Local Recipe Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supplement TheMealDB API with a large local dataset of 100+ recipes to ensure every ingredient search returns results.

**Architecture:** Create a `data/local-recipes.ts` data store and update `lib/mealdb.ts` to search and merge results from both local and remote sources. Use a `local-` ID prefix for local recipes to avoid collisions and simplify routing.

**Tech Stack:** Next.js (App Router), TypeScript, TheMealDB API.

---

### Task 1: Create Local Recipe Data Store

**Files:**
- Create: `data/local-recipes.ts`

- [ ] **Step 1: Define the data structure and initial recipes**

Create `data/local-recipes.ts` with a few sample recipes to test the integration. (Note: I will add more recipes in a later task or as a separate batch).

```typescript
import { MealDetail } from "@/types/meal";

export const LOCAL_MEALS: MealDetail[] = [
  {
    idMeal: "local-1",
    strMeal: "Lemon Herb Roasted Chicken",
    strMealThumb: "https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg",
    strCategory: "Chicken",
    strArea: "American",
    strInstructions: "1. Season chicken with salt, pepper, lemon zest, and herbs. 2. Roast at 200C for 45-60 mins until cooked through. 3. Let rest before carving.",
    strYoutube: "",
    strSource: "",
    strTags: "Chicken,Healthy,Roast",
    strIngredient1: "Chicken",
    strIngredient2: "Lemon",
    strIngredient3: "Garlic",
    strIngredient4: "Rosemary",
    strIngredient5: "Thyme",
    strIngredient6: "Olive Oil",
    strIngredient7: "Salt",
    strIngredient8: "Black Pepper",
    strIngredient9: "",
    strIngredient10: "",
    strIngredient11: "",
    strIngredient12: "",
    strIngredient13: "",
    strIngredient14: "",
    strIngredient15: "",
    strIngredient16: "",
    strIngredient17: "",
    strIngredient18: "",
    strIngredient19: "",
    strIngredient20: "",
    strMeasure1: "1 whole",
    strMeasure2: "1 large",
    strMeasure3: "3 cloves",
    strMeasure4: "1 sprig",
    strMeasure5: "1 sprig",
    strMeasure6: "2 tbsp",
    strMeasure7: "1 tsp",
    strMeasure8: "1/2 tsp",
    strMeasure9: "",
    strMeasure10: "",
    strMeasure11: "",
    strMeasure12: "",
    strMeasure13: "",
    strMeasure14: "",
    strMeasure15: "",
    strMeasure16: "",
    strMeasure17: "",
    strMeasure18: "",
    strMeasure19: "",
    strMeasure20: "",
  },
  {
    idMeal: "local-2",
    strMeal: "Creamy Garlic Mushroom Pasta",
    strMealThumb: "https://www.themealdb.com/images/media/meals/wvpsrt1468256358.jpg",
    strCategory: "Pasta",
    strArea: "Italian",
    strInstructions: "1. Boil pasta. 2. Sauté mushrooms and garlic in butter. 3. Add cream and simmer. 4. Toss with pasta and parmesan.",
    strYoutube: "",
    strSource: "",
    strTags: "Pasta,Vegetarian,Mushroom",
    strIngredient1: "Pasta",
    strIngredient2: "Mushrooms",
    strIngredient3: "Garlic",
    strIngredient4: "Heavy Cream",
    strIngredient5: "Butter",
    strIngredient6: "Parmesan Cheese",
    strIngredient7: "Parsley",
    strIngredient8: "",
    strIngredient9: "",
    strIngredient10: "",
    strIngredient11: "",
    strIngredient12: "",
    strIngredient13: "",
    strIngredient14: "",
    strIngredient15: "",
    strIngredient16: "",
    strIngredient17: "",
    strIngredient18: "",
    strIngredient19: "",
    strIngredient20: "",
    strMeasure1: "250g",
    strMeasure2: "200g",
    strMeasure3: "2 cloves",
    strMeasure4: "1/2 cup",
    strMeasure5: "1 tbsp",
    strMeasure6: "1/4 cup",
    strMeasure7: "garnish",
    strMeasure8: "",
    strMeasure9: "",
    strMeasure10: "",
    strMeasure11: "",
    strMeasure12: "",
    strMeasure13: "",
    strMeasure14: "",
    strMeasure15: "",
    strMeasure16: "",
    strMeasure17: "",
    strMeasure18: "",
    strMeasure19: "",
    strMeasure20: "",
  }
];
```

- [ ] **Step 2: Commit**

```bash
git add data/local-recipes.ts
git commit -m "chore: add local recipe data store with initial samples"
```

### Task 2: Implement Local Search Helpers in `lib/mealdb.ts`

**Files:**
- Modify: `lib/mealdb.ts`

- [ ] **Step 1: Import LOCAL_MEALS and implement local fetchers**

Add the import and the following helper functions to `lib/mealdb.ts`.

```typescript
import { LOCAL_MEALS } from "@/data/local-recipes";

// ... existing code ...

function getLocalMealsByIngredient(ingredient: string): MealSummary[] {
  const normalized = ingredient.toLowerCase();
  return LOCAL_MEALS.filter(meal => {
    for (let i = 1; i <= 20; i++) {
      const ing = (meal as any)[`strIngredient${i}`];
      if (ing && ing.toLowerCase().includes(normalized)) return true;
    }
    return false;
  }).map(m => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strMealThumb: m.strMealThumb
  }));
}

function getLocalMealById(id: string): MealDetail | null {
  return LOCAL_MEALS.find(m => m.idMeal === id) ?? null;
}

function searchLocalMealsByName(name: string): MealSummary[] {
  const normalized = name.toLowerCase();
  return LOCAL_MEALS.filter(m => 
    m.strMeal.toLowerCase().includes(normalized)
  ).map(m => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strMealThumb: m.strMealThumb
  }));
}
```

- [ ] **Step 2: Update fetchMealsByIngredient to use local data**

```typescript
export async function fetchMealsByIngredient(
  ingredient: string
): Promise<MealSummary[]> {
  const cached = cache.get(ingredient);
  if (cached) return cached;

  // Remote fetch
  const data = await fetchJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  const remoteMeals = data?.meals ?? [];

  // Local fetch
  const localMatches = getLocalMealsByIngredient(ingredient);

  // Merge and deduplicate
  const seen = new Set<string>();
  const meals: MealSummary[] = [];
  
  [...remoteMeals, ...localMatches].forEach(m => {
    if (!seen.has(m.idMeal)) {
      seen.add(m.idMeal);
      meals.push(m);
    }
  });

  cache.set(ingredient, meals);
  return meals;
}
```

- [ ] **Step 3: Update fetchMealById to handle local IDs**

```typescript
export async function fetchMealById(
  id: string
): Promise<MealDetail | null> {
  if (id.startsWith("local-")) {
    return getLocalMealById(id);
  }

  const data = await fetchJson<{ meals: MealDetail[] | null }>(
    `${BASE}/lookup.php?i=${encodeURIComponent(id)}`
  );
  return data?.meals?.[0] ?? null;
}
```

- [ ] **Step 4: Update searchMealsByName to include local results**

```typescript
export async function searchMealsByName(
  name: string
): Promise<MealSummary[]> {
  const data = await fetchJson<{ meals: MealSummary[] | null }>(
    `${BASE}/search.php?s=${encodeURIComponent(name)}`
  );
  const remote = data?.meals ?? [];
  const local = searchLocalMealsByName(name);
  
  const seen = new Set<string>();
  const results: MealSummary[] = [];
  [...remote, ...local].forEach(m => {
    if (!seen.has(m.idMeal)) {
      seen.add(m.idMeal);
      results.push(m);
    }
  });
  return results;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/mealdb.ts
git commit -m "feat: integrate local recipe search into mealdb service"
```

### Task 3: Populate `data/local-recipes.ts` with Massive Dataset

**Files:**
- Modify: `data/local-recipes.ts`

- [ ] **Step 1: Add ~100+ more recipes to the dataset**

I will now generate and add a large volume of recipes to the `LOCAL_MEALS` array in `data/local-recipes.ts`. I will ensure coverage for many common ingredients.

- [ ] **Step 2: Commit**

```bash
git add data/local-recipes.ts
git commit -m "feat: expand local recipe dataset with 100+ new entries"
```

### Task 4: Verification and Final Checks

- [ ] **Step 1: Test with a local-only ingredient**

Try searching for an ingredient that you know is only in your local dataset (e.g., "Rosemary" if it wasn't well-covered by MealDB).

- [ ] **Step 2: Verify recipe detail page**

Click on a local recipe (one with `local-` ID) and ensure the details (instructions, ingredients) render correctly.

- [ ] **Step 3: Check "No results" case**

Try to find an ingredient that still returns nothing. If it happens, add a recipe for it!
