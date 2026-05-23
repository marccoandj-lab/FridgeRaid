"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "fridge-raid-ingredients";

function loadIngredients(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i): i is string => typeof i === "string");
  } catch {
    return [];
  }
}

function saveIngredients(ingredients: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<string[]>(loadIngredients);

  const addIngredient = useCallback((name: string) => {
    setIngredients((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      saveIngredients(next);
      return next;
    });
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setIngredients((prev) => {
      const next = prev.filter((i) => i !== name);
      saveIngredients(next);
      return next;
    });
  }, []);

  const toggleIngredient = useCallback((name: string) => {
    setIngredients((prev) => {
      const exists = prev.includes(name);
      const next = exists
        ? prev.filter((i) => i !== name)
        : [...prev, name];
      saveIngredients(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setIngredients([]);
    saveIngredients([]);
  }, []);

  return { ingredients, addIngredient, removeIngredient, toggleIngredient, clearAll };
}
