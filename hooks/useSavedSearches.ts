"use client";

import { useState, useCallback, useEffect } from "react";

export interface SavedSearch {
  id: string;
  name: string;
  ingredients: string[];
  savedAt: number;
}

const STORAGE_KEY = "fridge-raid-saved-searches";

function load(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(searches: SavedSearch[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {}
}

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSearches(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(searches);
  }, [searches, loaded]);

  const saveSearch = useCallback(
    (name: string, ingredients: string[]) => {
      const existing = searches.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        setSearches((prev) =>
          prev.map((s) =>
            s.id === existing.id
              ? { ...s, ingredients, savedAt: Date.now() }
              : s
          )
        );
        return;
      }
      const newSearch: SavedSearch = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        name,
        ingredients,
        savedAt: Date.now(),
      };
      setSearches((prev) => [...prev, newSearch]);
    },
    [searches]
  );

  const deleteSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { searches, saveSearch, deleteSearch };
}
