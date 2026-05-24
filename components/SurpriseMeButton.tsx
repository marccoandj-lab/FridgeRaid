'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { getRandomMeals } from '@/lib/mealdb'
import type { MealSummary } from '@/types/meal'

interface SurpriseMeButtonProps {
  meals: MealSummary[]
  ingredients: string[]
}

export function SurpriseMeButton({ meals, ingredients }: SurpriseMeButtonProps) {
  const router = useRouter()
  const [surprising, setSurprising] = useState(false)

  const handleSurprise = async () => {
    if (surprising) return
    setSurprising(true)

    try {
      if (meals.length > 0) {
        const pick = meals[Math.floor(Math.random() * meals.length)]
        router.push(`/recipe/${pick.idMeal}`)
      } else {
        const random = await getRandomMeals(1)
        if (random.length > 0) router.push(`/recipe/${random[0].idMeal}`)
      }
    } finally {
      setSurprising(false)
    }
  }

  return (
    <button
      onClick={handleSurprise}
      disabled={surprising}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-card px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-amber-500/40 hover:text-foreground disabled:opacity-50"
    >
      <Sparkles size={16} className="text-amber-500" />
      {surprising ? 'Picking...' : ingredients.length > 0 ? 'Surprise me' : 'Random recipe'}
    </button>
  )
}
