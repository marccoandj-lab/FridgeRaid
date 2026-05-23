"use client";

import { useState, useCallback } from "react";
import type { FavoriteMeal } from "@/types/meal";

const STORAGE_KEY = "fridge-raid-favorites";

function loadFavorites(): FavoriteMeal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is FavoriteMeal =>
        typeof f === "object" &&
        f !== null &&
        typeof f.idMeal === "string" &&
        typeof f.strMeal === "string"
    );
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteMeal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMeal[]>(loadFavorites);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.idMeal === id),
    [favorites]
  );

  const toggleFavorite = useCallback((meal: FavoriteMeal) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.idMeal === meal.idMeal);
      const next = exists
        ? prev.filter((f) => f.idMeal !== meal.idMeal)
        : [...prev, { ...meal, savedAt: Date.now() }];
      saveFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
