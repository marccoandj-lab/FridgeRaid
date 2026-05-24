'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { MealSummary } from '@/types/meal'
import { FavoriteButton } from '@/components/FavoriteButton'
import { AddToCookbookButton } from '@/components/AddToCookbookButton'

interface RecipeCardProps {
  meal: MealSummary
  priority?: boolean
}

export const RecipeCard = memo(function RecipeCard({
  meal,
  priority = false,
}: RecipeCardProps) {
  return (
    <Link href={`/recipe/${meal.idMeal}`} className="block">
      <div className="group/card relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:ring-amber-500/20">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={meal.strMealThumb}
            alt={meal.strMeal}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 group-hover/card:scale-110 group-hover/card:brightness-110"
            loading={priority ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
          <div className="absolute right-2 top-2 z-10 flex gap-1.5">
            <AddToCookbookButton
              mealId={meal.idMeal}
              mealName={meal.strMeal}
              mealThumb={meal.strMealThumb}
            />
            <FavoriteButton
              mealId={meal.idMeal}
              mealName={meal.strMeal}
              mealThumb={meal.strMealThumb}
            />
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-heading line-clamp-2 text-sm font-bold text-foreground transition-colors group-hover/card:text-amber-300">
            {meal.strMeal}
          </h3>
        </div>
      </div>
    </Link>
  )
})
