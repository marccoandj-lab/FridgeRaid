"use client";

import { useState, useCallback, useEffect } from "react";

export const DIET_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "keto", label: "Keto / Low-Carb" },
  { id: "paleo", label: "Paleo" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "nut-free", label: "Nut-Free" },
  { id: "low-calorie", label: "Low Calorie" },
] as const;

export type DietId = (typeof DIET_OPTIONS)[number]["id"];

const STORAGE_KEY = "fridge-raid-diet";

function load(): DietId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d): d is DietId => DIET_OPTIONS.some((o) => o.id === d)) : [];
  } catch {
    return [];
  }
}

function save(diets: DietId[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diets));
  } catch {}
}

export function useDietaryPreferences() {
  const [diets, setDiets] = useState<DietId[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDiets(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(diets);
  }, [diets, loaded]);

  const toggleDiet = useCallback((id: DietId) => {
    setDiets((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }, []);

  return { diets, toggleDiet };
}
