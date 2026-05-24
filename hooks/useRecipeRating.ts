"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "fridge-raid-ratings";

interface RecipeRating {
  recipeId: string;
  rating: number; // 1-5
  ratedAt: number;
}

function load(): RecipeRating[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(ratings: RecipeRating[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {}
}

export function useRecipeRating(recipeId: string) {
  const [ratings, setRatings] = useState<RecipeRating[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRatings(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(ratings);
  }, [ratings, loaded]);

  const currentRating = ratings.find((r) => r.recipeId === recipeId)?.rating ?? 0;

  const setRating = useCallback(
    (rating: number) => {
      setRatings((prev) => {
        const existing = prev.findIndex((r) => r.recipeId === recipeId);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = { recipeId, rating, ratedAt: Date.now() };
          return next;
        }
        return [...prev, { recipeId, rating, ratedAt: Date.now() }];
      });
    },
    [recipeId]
  );

  return { currentRating, setRating };
}
