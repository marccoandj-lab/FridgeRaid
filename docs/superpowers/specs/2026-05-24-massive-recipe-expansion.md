# Spec: Massive Local Recipe Expansion

**Status:** Approved
**Date:** 2026-05-24
**Topic:** Recipe Data Expansion

## 1. Goal
Ensure that searching for ingredients in the "Fridge Raid" app always returns recipes. This is achieved by supplementing the external MealDB API with a large, high-quality local dataset of recipes.

## 2. Architecture
We will introduce a local data source integrated directly into the existing `lib/mealdb.ts` service layer.

### New Components:
- `data/local-recipes.ts`: A TypeScript file exporting an array of `MealDetail` objects. This file will contain 100-200 hand-crafted or generated recipes covering a wide variety of ingredients.

### Modified Components:
- `lib/mealdb.ts`: Updated to act as a hybrid data provider, merging results from both local and remote sources.

## 3. Data Structure
Local recipes will adhere to the `MealDetail` interface from `types/meal.ts` to ensure compatibility with existing UI components (`RecipeCard`, `RecipeGrid`, etc.).

- **ID Mapping:** Local recipes will use the prefix `local-` (e.g., `local-1`, `local-2`) to distinguish them from MealDB's numeric IDs and prevent collisions.
- **Ingredient Matching:** Local search will perform case-insensitive substring matching against the `strIngredientX` fields.

## 4. Integration Strategy

### Search Logic (`lib/mealdb.ts`):
1. **Parallel Fetching:** `fetchMealsByIngredient` will call the API and simultaneously filter the `LOCAL_MEALS` array.
2. **Merging:** Results will be combined, with local matches appended to remote ones.
3. **Lookup:** `fetchMealById` will check for the `local-` prefix; if present, it will return the recipe from the local array immediately, skipping the API call.

### Randomization (`getRandomMeals`):
- Will sample from both the remote API and the local dataset to increase variety.

## 5. Implementation Steps
1. Create the `data/` directory and `local-recipes.ts` with initial recipe data.
2. Implement local search helper functions in `lib/mealdb.ts`.
3. Update exported fetcher functions in `lib/mealdb.ts` to use the hybrid logic.
4. Verify by searching for ingredients known to be in the local dataset.

## 6. Success Criteria
- Searching for any common ingredient returns at least one recipe.
- Local recipes display correctly in the search grid and detail page.
- No regressions in remote API functionality.
