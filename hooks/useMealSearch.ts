"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getMealsByIngredients, getRandomMeals } from "@/lib/mealdb";
import type { MealSummary } from "@/types/meal";

export function useMealSearch(ingredients: string[]) {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      setHasMore(true);

      try {
        const result =
          ingredients.length === 0
            ? await getRandomMeals(8)
            : await getMealsByIngredients(ingredients);

        const seen = new Set<string>();
        const unique = result.filter((m) => {
          if (seen.has(m.idMeal)) return false;
          seen.add(m.idMeal);
          return true;
        });
        setMeals(unique);
        if (unique.length < 8) setHasMore(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch meals");
        setMeals([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ingredients]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const result =
        ingredients.length === 0
          ? await getRandomMeals(8)
          : await getMealsByIngredients(ingredients);

      setMeals((prev) => {
        const seen = new Set(prev.map((m) => m.idMeal));
        const newMeals = result.filter((m) => !seen.has(m.idMeal));
        if (newMeals.length < 6) setHasMore(false);
        return [...prev, ...newMeals];
      });
    } catch {
      // silently fail for loadMore
    } finally {
      setIsLoadingMore(false);
    }
  }, [ingredients, isLoadingMore, hasMore]);

  return { meals, isLoading, isLoadingMore, error, hasMore, loadMore };
}
