"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "fridge-raid-cooked-dates";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCooked: number;
  lastCookedDate: string | null;
}

function loadDates(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDates(dates: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch {}
}

function computeStreak(dates: string[]): StreakData {
  const unique = [...new Set(dates)].sort().reverse();
  const totalCooked = unique.length;

  if (unique.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCooked: 0, lastCookedDate: null };
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentStreak = 0;
  if (unique[0] === today || unique[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < unique.length; i++) {
      const prev = new Date(unique[i - 1]);
      const curr = new Date(unique[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (Math.round(diff) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = Math.max(1, currentStreak);
  let tempStreak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak, totalCooked, lastCookedDate: unique[0] };
}

export function useCookingStreaks() {
  const [dates, setDates] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return loadDates();
  });
  const [streakData, setStreakData] = useState<StreakData>(() => computeStreak(dates));

  useEffect(() => {
    setStreakData(computeStreak(dates));
    saveDates(dates);
  }, [dates]);

  const markCooked = useCallback((recipeId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `${today}::${recipeId}`;
    setDates((prev) => {
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  }, []);

  return { ...streakData, markCooked };
}
