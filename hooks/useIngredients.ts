"use client";

import { useIngredientsContext } from "@/lib/IngredientsProvider";

export function useIngredients() {
  return useIngredientsContext();
}
