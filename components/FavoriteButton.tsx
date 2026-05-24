'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  mealId: string
  mealName: string
  mealThumb: string
  className?: string
}

export function FavoriteButton({
  mealId,
  mealName,
  mealThumb,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  const liked = isFavorite(mealId)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite({ idMeal: mealId, strMeal: mealName, strMealThumb: mealThumb, savedAt: Date.now() })
      }}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70',
        className
      )}
    >
      <motion.div
        key={liked ? 'filled' : 'outline'}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <Heart
          size={16}
          className={cn(
            'transition-colors',
            liked ? 'fill-red-500 text-red-500' : 'text-white'
          )}
        />
      </motion.div>
    </button>
  )
}
