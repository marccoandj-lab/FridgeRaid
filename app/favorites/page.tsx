'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { RecipeCard } from '@/components/RecipeCard'
import { EmptyState } from '@/components/EmptyState'
import { useFavorites } from '@/hooks/useFavorites'

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  const sorted = useMemo(
    () => [...favorites].sort((a, b) => b.savedAt - a.savedAt),
    [favorites]
  )

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground sm:mb-8 sm:text-4xl">
        Saved Recipes
      </h1>

      {sorted.length === 0 ? (
        <EmptyState
          type="no-favorites"
          action={{ label: 'Find recipes', href: '/' }}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          >
            {sorted.map((fav, index) => (
              <motion.div
                key={fav.idMeal}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <RecipeCard
                  meal={{
                    idMeal: fav.idMeal,
                    strMeal: fav.strMeal,
                    strMealThumb: fav.strMealThumb,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </main>
    </>
  )
}
