"use client";

import { useState, useCallback, useEffect } from "react";

export interface MealPlanEntry {
  date: string;
  recipeId: string;
  recipeName: string;
  recipeThumb: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

const STORAGE_KEY = "fridge-raid-meal-plan";

function load(): MealPlanEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(plan: MealPlanEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {}
}

export function useMealPlan() {
  const [plan, setPlan] = useState<MealPlanEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPlan(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(plan);
  }, [plan, loaded]);

  const addToPlan = useCallback(
    (entry: Omit<MealPlanEntry, "recipeThumb"> & { recipeThumb?: string }) => {
      const exists = plan.some(
        (p) => p.date === entry.date && p.mealType === entry.mealType
      );
      if (exists) return;
      setPlan((prev) => [
        ...prev,
        { ...entry, recipeThumb: entry.recipeThumb ?? "" },
      ]);
    },
    [plan]
  );

  const removeFromPlan = useCallback((date: string, mealType: string) => {
    setPlan((prev) => prev.filter((p) => !(p.date === date && p.mealType === mealType)));
  }, []);

  const getDayPlan = useCallback(
    (date: string): Partial<Record<MealPlanEntry["mealType"], MealPlanEntry>> => {
      const entries = plan.filter((p) => p.date === date);
      const map: Partial<Record<MealPlanEntry["mealType"], MealPlanEntry>> = {};
      for (const e of entries) map[e.mealType] = e;
      return map;
    },
    [plan]
  );

  const getWeekPlan = useCallback(
    (startDate: string): MealPlanEntry[] => {
      return plan.filter((p) => p.date >= startDate);
    },
    [plan]
  );

  return { plan, addToPlan, removeFromPlan, getDayPlan, getWeekPlan };
}
