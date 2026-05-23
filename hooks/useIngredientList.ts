"use client";

import { useState, useEffect } from "react";
import { fetchIngredientList } from "@/lib/mealdb";
import type { IngredientItem } from "@/types/meal";

let cachedList: IngredientItem[] | null = null;

export function useIngredientList() {
  const [ingredientList, setIngredientList] = useState<IngredientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedList) {
      setIngredientList(cachedList);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    fetchIngredientList().then((data) => {
      if (cancelled) return;
      cachedList = data;
      setIngredientList(data);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ingredientList, isLoading };
}
