'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { MealSummary } from '@/types/meal'
import { RecipeCard } from '@/components/RecipeCard'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

interface RecipeGridProps {
  meals: MealSummary[]
  isLoading: boolean
  isLoadingMore?: boolean
  error?: string | null
  hasMore?: boolean
  hasIngredients?: boolean
  onLoadMore?: () => void
}

const gridCols = 'grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4'

export function RecipeGrid({
  meals,
  isLoading,
  isLoadingMore = false,
  error,
  hasMore = false,
  hasIngredients = false,
  onLoadMore,
}: RecipeGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading || isLoadingMore) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore, hasMore, isLoading, isLoadingMore])

  if (isLoading && meals.length === 0) {
    return (
      <div className={gridCols}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <EmptyState type="error" />
  }

  if (meals.length === 0 && !isLoading) {
    return (
      <EmptyState
        type={hasIngredients ? 'no-results' : 'no-ingredients'}
      />
    )
  }

  return (
    <>
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className={gridCols}
        >
          {meals.map((meal, index) => (
            <motion.div
              key={meal.idMeal}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <RecipeCard
                meal={meal}
                priority={index < 4}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-amber-500" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
        </div>
      )}

      {hasMore && !isLoadingMore && (
        <div ref={sentinelRef} className="h-4" />
      )}

      {!hasMore && meals.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          All recipes loaded
        </p>
      )}
    </>
  )
}
