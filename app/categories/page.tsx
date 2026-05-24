'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, LayoutList, Beef, Drumstick, CakeSlice, ChefHat, Pizza, Fish, Apple, Egg, Milk, Coffee, Sprout, Vegan } from 'lucide-react'
import { RecipeCard } from '@/components/RecipeCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { listCategories, fetchMealsByCategory } from '@/lib/mealdb'
import type { MealSummary } from '@/types/meal'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Beef: <Beef size={24} />,
  Chicken: <Drumstick size={24} />,
  Dessert: <CakeSlice size={24} />,
  Lamb: <ChefHat size={24} />,
  Miscellaneous: <Pizza size={24} />,
  Pasta: <Pizza size={24} />,
  Pork: <Drumstick size={24} />,
  Seafood: <Fish size={24} />,
  Side: <Apple size={24} />,
  Starter: <Coffee size={24} />,
  Vegan: <Sprout size={24} />,
  Vegetarian: <Vegan size={24} />,
  Breakfast: <Egg size={24} />,
  Goat: <ChefHat size={24} />,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [meals, setMeals] = useState<MealSummary[]>([])
  const [mealsLoading, setMealsLoading] = useState(false)

  useEffect(() => {
    listCategories().then((cats) => {
      setCategories(cats)
      setIsLoading(false)
    })
  }, [])

  const handleSelect = useCallback(async (cat: string) => {
    setSelected(cat)
    setMealsLoading(true)
    setMeals([])
    const results = await fetchMealsByCategory(cat)
    setMeals(results)
    setMealsLoading(false)
  }, [])

  const handleBack = useCallback(() => {
    setSelected(null)
    setMeals([])
  }, [])

  return (
    <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-4 sm:pb-16 sm:pt-6">
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} />
              All Categories
            </Button>

            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-foreground sm:text-4xl">
                {selected}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mealsLoading ? 'Loading...' : `${meals.length} recipes`}
              </p>
            </div>

            {mealsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
              >
                {meals.map((meal) => (
                  <motion.div
                    key={meal.idMeal}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <RecipeCard meal={meal} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-6 space-y-1 sm:mb-8 sm:space-y-2"
            >
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Browse by Category
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Find recipes by meal type and cuisine category
              </p>
            </motion.section>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {categories.map((cat, i) => (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(cat)}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-amber-500/10 bg-card p-5 text-center transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 sm:gap-3 sm:p-6"
                  >
                    <span className="text-foreground/80 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-400">
                      {CATEGORY_ICONS[cat] ?? <ChefHat size={24} />}
                    </span>
                    <span className="font-heading text-sm font-bold text-foreground transition-colors group-hover:text-amber-300">
                      {cat}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
