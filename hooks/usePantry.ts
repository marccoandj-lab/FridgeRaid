"use client";

import { useState, useCallback, useEffect } from "react";

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string | null;
  addedAt: number;
}

const STORAGE_KEY = "fridge-raid-pantry";

const CATEGORIES = [
  "vegetables", "fruits", "dairy", "meat", "seafood",
  "grains", "spices", "condiments", "pantry", "frozen", "other",
] as const;

export type PantryCategory = (typeof CATEGORIES)[number];

function load(): PantryItem[] {
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

function save(items: PantryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(items);
  }, [items, loaded]);

  const addItem = useCallback(
    (item: Omit<PantryItem, "id" | "addedAt">) => {
      const newItem: PantryItem = {
        ...item,
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        addedAt: Date.now(),
      };
      setItems((prev) => [...prev, newItem]);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<PantryItem, "id" | "addedAt">>) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
    },
    []
  );

  const clearAll = useCallback(() => setItems([]), []);

  const itemsByCategory = useCallback(() => {
    const map = new Map<string, PantryItem[]>();
    for (const item of items) {
      const cat = item.category || "other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [items]);

  const expiringItems = useCallback(
    (days = 3): PantryItem[] => {
      const now = Date.now();
      const limit = days * 24 * 60 * 60 * 1000;
      return items.filter((i) => {
        if (!i.expiryDate) return false;
        const expiry = new Date(i.expiryDate).getTime();
        return expiry > now && expiry - now <= limit;
      });
    },
    [items]
  );

  const expiredItems = useCallback((): PantryItem[] => {
    const now = Date.now();
    return items.filter((i) => {
      if (!i.expiryDate) return false;
      return new Date(i.expiryDate).getTime() < now;
    });
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearAll,
    itemsByCategory,
    expiringItems,
    expiredItems,
    categories: CATEGORIES,
  };
}
