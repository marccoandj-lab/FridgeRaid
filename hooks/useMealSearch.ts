"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getMealsByIngredients, getExpandedMealsByIngredients, getRandomMeals } from "@/lib/mealdb";
import type { MealSummary } from "@/types/meal";

const INITIAL_BATCH_SIZE = 12;
const LOAD_MORE_SIZE = 8;

export function useMealSearch(ingredients: string[]) {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ingredientResultsRef = useRef<MealSummary[]>([]);
  const currentOffsetRef = useRef(0);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setError(null);
      setHasMore(true);
      seenIdsRef.current = new Set();
      currentOffsetRef.current = 0;
      setIsLoading(true);

      try {
        let result: MealSummary[] = [];
        if (ingredients.length === 0) {
          result = await getRandomMeals(INITIAL_BATCH_SIZE);
          ingredientResultsRef.current = [];
        } else {
          // Get strict matches first
          const strict = await getMealsByIngredients(ingredients);
          const combined = [...strict];
          
          // If few strict matches, get expanded matches
          if (combined.length < INITIAL_BATCH_SIZE) {
            const expanded = await getExpandedMealsByIngredients(ingredients);
            const seen = new Set(combined.map(m => m.idMeal));
            for (const m of expanded) {
              if (!seen.has(m.idMeal)) {
                combined.push(m);
                seen.add(m.idMeal);
              }
            }
          }
          
          ingredientResultsRef.current = combined;
          result = combined.slice(0, INITIAL_BATCH_SIZE);
          currentOffsetRef.current = result.length;
        }

        const unique = result.filter((m) => {
          if (seenIdsRef.current.has(m.idMeal)) return false;
          seenIdsRef.current.add(m.idMeal);
          return true;
        });

        setMeals(unique);
        if (ingredients.length > 0 && currentOffsetRef.current >= ingredientResultsRef.current.length) {
          // If we've exhausted all ingredient-based matches, we could potentially stop or add random ones
          // For "infinite" feel, we'll keep hasMore true but maybe random matches later?
          // User asked for infinite, so let's set hasMore true if we can always get randoms
          setHasMore(true);
        }
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
      let result: MealSummary[] = [];
      if (ingredients.length === 0) {
        result = await getRandomMeals(LOAD_MORE_SIZE);
      } else {
        const nextBatch = ingredientResultsRef.current.slice(
          currentOffsetRef.current,
          currentOffsetRef.current + LOAD_MORE_SIZE
        );
        
        if (nextBatch.length > 0) {
          result = nextBatch;
          currentOffsetRef.current += nextBatch.length;
        } else {
          // No more ingredient matches
          setHasMore(false);
          setIsLoadingMore(false);
          return;
        }
      }

      setMeals((prev) => {
        const newMeals = result.filter((m) => !seenIdsRef.current.has(m.idMeal));
        newMeals.forEach(m => seenIdsRef.current.add(m.idMeal));
        
        if (newMeals.length === 0) {
          if (ingredients.length === 0) {
            // Random batch empty, stop
            setHasMore(false);
          } else {
            setHasMore(false);
          }
        }
        
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
