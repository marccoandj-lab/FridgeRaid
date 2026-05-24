"use client";

import { useState, useCallback, useEffect } from "react";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category: string;
  fromRecipe?: string;
  addedAt: number;
}

const STORAGE_KEY = "fridge-raid-shopping";

function load(): ShoppingItem[] {
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

function save(items: ShoppingItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(items);
  }, [items, loaded]);

  const addItem = useCallback(
    (item: Omit<ShoppingItem, "id" | "checked" | "addedAt">) => {
      const existing = items.find(
        (i) => i.name.toLowerCase() === item.name.toLowerCase() && !i.checked
      );
      if (existing) return;
      const newItem: ShoppingItem = {
        ...item,
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        checked: false,
        addedAt: Date.now(),
      };
      setItems((prev) => [...prev, newItem]);
    },
    [items]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.checked));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const addFromRecipe = useCallback(
    (ingredients: { name: string; measure: string }[], recipeName: string) => {
      for (const ing of ingredients) {
        addItem({
          name: ing.name,
          quantity: ing.measure,
          category: "other",
          fromRecipe: recipeName,
        });
      }
    },
    [addItem]
  );

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  return {
    items,
    uncheckedItems,
    checkedItems,
    addItem,
    removeItem,
    toggleItem,
    clearChecked,
    clearAll,
    addFromRecipe,
  };
}
