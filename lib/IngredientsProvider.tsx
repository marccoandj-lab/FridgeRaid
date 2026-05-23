"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "fridge-raid-ingredients";

interface IngredientsContextType {
  ingredients: string[];
  addIngredient: (name: string) => void;
  removeIngredient: (name: string) => void;
  toggleIngredient: (name: string) => void;
  clearAll: () => void;
}

const IngredientsContext = createContext<IngredientsContextType | undefined>(undefined);

function loadIngredients(): string[] {
  if (typeof window === "undefined") return [];
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
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  } catch {
    // localStorage unavailable
  }
}

export function IngredientsProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIngredients(loadIngredients());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveIngredients(ingredients);
    }
  }, [ingredients, isLoaded]);

  const addIngredient = useCallback((name: string) => {
    setIngredients((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name));
  }, []);

  const toggleIngredient = useCallback((name: string) => {
    setIngredients((prev) => {
      const exists = prev.includes(name);
      return exists
        ? prev.filter((i) => i !== name)
        : [...prev, name];
    });
  }, []);

  const clearAll = useCallback(() => {
    setIngredients([]);
  }, []);

  return (
    <IngredientsContext.Provider
      value={{ ingredients, addIngredient, removeIngredient, toggleIngredient, clearAll }}
    >
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredientsContext() {
  const context = useContext(IngredientsContext);
  if (context === undefined) {
    throw new Error("useIngredientsContext must be used within an IngredientsProvider");
  }
  return context;
}
