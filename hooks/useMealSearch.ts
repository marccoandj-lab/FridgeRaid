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
          // getMealsByIngredients now handles both strict and partial matches internally
          const allMatches = await getMealsByIngredients(ingredients);
          ingredientResultsRef.current = allMatches;
          result = allMatches.slice(0, INITIAL_BATCH_SIZE);
          currentOffsetRef.current = result.length;
        }

        const unique = result.filter((m) => {
          if (seenIdsRef.current.has(m.idMeal)) return false;
          seenIdsRef.current.add(m.idMeal);
          return true;
        });

        setMeals(unique);
        
        // If we have ingredients and our initial load covered everything, 
        // we might not have more ingredient-based recipes.
        if (ingredients.length > 0 && currentOffsetRef.current >= ingredientResultsRef.current.length) {
          setHasMore(false);
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
