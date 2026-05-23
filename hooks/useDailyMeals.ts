"use client";

import { useState, useEffect, useRef } from "react";
import { fetchMealById, getRandomMeals } from "@/lib/mealdb";
import type { MealDetail } from "@/types/meal";

const STORAGE_KEY = "fridge-raid-daily";

interface DailyCache {
  date: string;
  meals: MealDetail[];
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDaily(): MealDetail[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cached: DailyCache = JSON.parse(raw);
    if (cached.date === getTodayKey()) return cached.meals;
    return null;
  } catch {
    return null;
  }
}

function saveDaily(meals: MealDetail[]) {
  try {
    const cache: DailyCache = { date: getTodayKey(), meals };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // silent
  }
}

export function useDailyMeals() {
  const [meals, setMeals] = useState<MealDetail[]>(() => loadDaily() ?? []);
  const [isLoading, setIsLoading] = useState(!loadDaily());
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    const cached = loadDaily();
    if (cached) {
      setMeals(cached);
      setIsLoading(false);
      fetchedRef.current = true;
      return;
    }

    setIsLoading(true);
    fetchedRef.current = true;

    getRandomMeals(3).then(async (summaries) => {
      const details = await Promise.all(
        summaries.map((s) => fetchMealById(s.idMeal))
      );
      const valid = details.filter((d): d is MealDetail => d !== null);
      if (valid.length > 0) {
        setMeals(valid);
        saveDaily(valid);
      }
      setIsLoading(false);
    });
  }, []);

  return { meals, isLoading };
}
