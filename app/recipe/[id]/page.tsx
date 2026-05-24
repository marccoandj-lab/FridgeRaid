'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Check, ExternalLink, Film, ChefHat, UtensilsCrossed } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { FavoriteButton } from '@/components/FavoriteButton'
import { AddToCookbookButton } from '@/components/AddToCookbookButton'
import { fetchMealById, parseIngredients, getIngredientThumb } from '@/lib/mealdb'
import { useIngredients } from '@/hooks/useIngredients'
import type { MealDetail, RecipeIngredient } from '@/types/meal'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { ingredients: userIngredients } = useIngredients()
  const [meal, setMeal] = useState<MealDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [ingredientList, setIngredientList] = useState<RecipeIngredient[]>([])

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    fetchMealById(id)
      .then((data) => {
        if (data) {
          setMeal(data)
          setIngredientList(parseIngredients(data))
        } else {
          setError('Recipe not found')
        }
      })
      .catch(() => setError('Failed to load recipe'))
      .finally(() => setIsLoading(false))
  }, [id])

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="mb-6 h-8 w-24" />
          <Skeleton className="mb-8 aspect-[2/1] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        </main>
      </>
    )
  }

  if (error || !meal) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <EmptyState type="error" />
        </main>
      </>
    )
  }

  const steps = meal.strInstructions
    .split(/\n|\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const matchCount = ingredientList.filter((ing) =>
    userIngredients.some((ui) => ui.toLowerCase() === ing.name.toLowerCase())
  ).length

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16">

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-4"
        >
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-muted-foreground">
            <ArrowLeft size={16} />
            Back
          </Button>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10 overflow-hidden rounded-2xl"
        >
          <div className="relative aspect-[2/1] sm:aspect-[3/1]">
            <Image
              src={meal.strMealThumb}
              alt={meal.strMeal}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {meal.strCategory && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  {meal.strCategory}
                </Badge>
              )}
              {meal.strArea && (
                <Badge variant="outline" className="border-amber-500/20 text-muted-foreground">
                  {meal.strArea}
                </Badge>
              )}
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl md:text-5xl leading-tight">
              {meal.strMeal}
            </h1>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <AddToCookbookButton
              mealId={meal.idMeal}
              mealName={meal.strMeal}
              mealThumb={meal.strMealThumb}
              size="md"
            />
            <FavoriteButton
              mealId={meal.idMeal}
              mealName={meal.strMeal}
              mealThumb={meal.strMealThumb}
              className="static h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm ring-1 ring-white/10"
            />
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-10 flex flex-wrap gap-6 text-sm"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChefHat size={16} className="text-amber-500" />
            <span>{ingredientList.length} ingredients</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UtensilsCrossed size={16} className="text-amber-500" />
            <span>{steps.length} steps</span>
          </div>
          {matchCount > 0 && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Check size={16} />
              <span>{matchCount} ingredient{matchCount !== 1 ? 's' : ''} you have</span>
            </div>
          )}
        </motion.div>

        {/* Ingredients */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-12"
        >
          <h2 className="mb-5 font-heading text-xl font-bold text-foreground">
            Ingredients
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ingredientList.map((ing, i) => {
              const hasIt = userIngredients.some(
                (ui) => ui.toLowerCase() === ing.name.toLowerCase()
              )
              return (
                <motion.div
                  key={ing.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                    hasIt
                      ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20'
                      : 'bg-card ring-1 ring-foreground/5 hover:ring-amber-500/20'
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={getIngredientThumb(ing.name)}
                      alt={ing.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${hasIt ? 'text-emerald-400' : 'text-foreground'}`}>
                      {ing.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{ing.measure}</p>
                  </div>
                  {hasIt && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check size={12} className="text-emerald-400" />
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Instructions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-12"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Instructions
            </h2>
            <span className="text-xs text-muted-foreground">
              {completedSteps.size}/{steps.length} done
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(completedSteps.size / Math.max(steps.length, 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => {
              const done = completedSteps.has(i)
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.02 }}
                >
                  <button
                    onClick={() => toggleStep(i)}
                    className={`flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all ${
                      done
                        ? 'bg-emerald-500/5 ring-1 ring-emerald-500/10'
                        : 'bg-card ring-1 ring-foreground/5 hover:ring-amber-500/20'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {done ? <Check size={14} /> : i + 1}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${
                        done
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {step}
                    </span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* External links */}
        {(meal.strYoutube || meal.strSource) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {meal.strYoutube && (
              <a href={meal.strYoutube} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 border-amber-500/20 text-muted-foreground hover:text-foreground">
                  <Film size={16} />
                  Watch on YouTube
                </Button>
              </a>
            )}
            {meal.strSource && (
              <a href={meal.strSource} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 border-amber-500/20 text-muted-foreground hover:text-foreground">
                  <ExternalLink size={16} />
                  Original Source
                </Button>
              </a>
            )}
          </motion.div>
        )}
      </main>
    </>
  )
}
