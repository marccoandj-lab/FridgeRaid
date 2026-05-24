'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Check, ExternalLink, Film, ChefHat, UtensilsCrossed, Minus, Plus, CookingPot, Maximize2, Minimize2, ChevronLeft, ChevronRight, Star, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { FavoriteButton } from '@/components/FavoriteButton'
import { AddToCookbookButton } from '@/components/AddToCookbookButton'
import { MealPlanPicker } from '@/components/MealPlanPicker'
import { fetchMealById, parseIngredients, getIngredientThumb } from '@/lib/mealdb'
import { useIngredients } from '@/hooks/useIngredients'
import { scaleIngredients } from '@/lib/scaleIngredients'
import { useRecipeRating } from '@/hooks/useRecipeRating'
import type { MealDetail, RecipeIngredient } from '@/types/meal'

const DEFAULT_SERVINGS = 4
const COOKED_KEY = 'fridge-raid-cooked'

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
  const [servings, setServings] = useState(DEFAULT_SERVINGS)
  const [cookMode, setCookMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [cooked, setCooked] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const touchStartRef = useRef(0)
  const { currentRating, setRating } = useRecipeRating(id)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored: string[] = JSON.parse(localStorage.getItem(COOKED_KEY) || '[]')
    setCooked(stored.includes(id))
  }, [id])

  useEffect(() => {
    return () => {
      wakeLockRef.current?.release()
    }
  }, [])

  const scaledIngredients = useMemo(
    () => scaleIngredients(ingredientList, DEFAULT_SERVINGS, servings),
    [ingredientList, servings]
  )

  const steps = useMemo(
    () =>
      meal?.strInstructions
        .split(/\n|\.\s+/)
        .map((s) => s.trim())
        .filter(Boolean) ?? [],
    [meal]
  )

  const matchCount = ingredientList.filter((ing) =>
    userIngredients.some((ui) => ui.toLowerCase() === ing.name.toLowerCase())
  ).length

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleServingsChange = (delta: number) => {
    setServings((s) => Math.max(1, Math.min(20, s + delta)))
  }

  const enterCookMode = async () => {
    setCookMode(true)
    setCurrentStep(0)
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {}
  }

  const exitCookMode = () => {
    setCookMode(false)
    wakeLockRef.current?.release()
  }

  const goToStep = (i: number) => {
    setCurrentStep(Math.max(0, Math.min(steps.length - 1, i)))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      goToStep(currentStep + (diff > 0 ? 1 : -1))
    }
  }

  const toggleCooked = () => {
    const stored: string[] = JSON.parse(localStorage.getItem(COOKED_KEY) || '[]')
    const next = cooked ? stored.filter((s) => s !== id) : [...stored, id]
    localStorage.setItem(COOKED_KEY, JSON.stringify(next))
    setCooked(!cooked)
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

  if (cookMode) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div
            key="cook-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={exitCookMode}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Minimize2 size={16} />
                Exit
              </button>
              <span className="font-heading text-sm font-bold text-amber-500">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-8 py-4 text-center">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 ring-2 ring-amber-500/30">
                <span className="font-heading text-4xl font-bold text-amber-400">{currentStep + 1}</span>
              </div>
              <p className="max-w-2xl text-left text-xl leading-relaxed text-foreground sm:text-2xl sm:leading-relaxed">
                {steps[currentStep]}
              </p>
            </div>

            <div className="flex items-center justify-between px-4 py-6">
              <button
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-muted-foreground ring-1 ring-foreground/10 transition-all hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep ? 'w-6 bg-amber-500' : 'w-2 bg-muted hover:bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => goToStep(currentStep + 1)}
                disabled={currentStep === steps.length - 1}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-muted-foreground ring-1 ring-foreground/10 transition-all hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="px-4 pb-8">
              <button
                onClick={() => toggleStep(currentStep)}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold transition-all ${
                  completedSteps.has(currentStep)
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {completedSteps.has(currentStep) ? (
                  <><Check size={20} /> Step completed</>
                ) : (
                  <><Check size={20} /> Mark as done</>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16">
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
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              {meal.strCategory && (
                <Badge variant="secondary" className="border-amber-500/30 bg-amber-500/20 text-amber-300">
                  {meal.strCategory}
                </Badge>
              )}
              {meal.strArea && (
                <Badge variant="outline" className="border-amber-500/20 text-muted-foreground">
                  {meal.strArea}
                </Badge>
              )}
            </div>
            <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {meal.strMeal}
            </h1>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <AddToCookbookButton mealId={meal.idMeal} mealName={meal.strMeal} mealThumb={meal.strMealThumb} size="md" />
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
          className="mb-8 flex flex-wrap gap-6 text-sm"
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
          <button
            onClick={toggleCooked}
            className={`flex items-center gap-2 transition-colors ${
              cooked ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CookingPot size={16} />
            <span>{cooked ? 'Cooked before' : 'Mark as cooked'}</span>
          </button>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="mb-8 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={16}
                  className={star <= currentRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}
                />
              </button>
            ))}
            {currentRating > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">{currentRating}/5</span>
            )}
          </div>
          <MealPlanPicker
            recipeId={meal.idMeal}
            recipeName={meal.strMeal}
            recipeThumb={meal.strMealThumb}
          />

          {/* Serving size */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mb-8 flex items-center gap-4"
          >
            <span className="text-sm font-medium text-foreground">Servings</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleServingsChange(-1)}
                disabled={servings <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 transition-all hover:text-foreground disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="font-heading w-8 text-center text-lg font-bold text-amber-400">{servings}</span>
              <button
                onClick={() => handleServingsChange(1)}
                disabled={servings >= 20}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 transition-all hover:text-foreground disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
            {servings !== DEFAULT_SERVINGS && (
              <button
                onClick={() => setServings(DEFAULT_SERVINGS)}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Reset
              </button>
            )}
          </motion.div>
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
            {servings !== DEFAULT_SERVINGS && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">(scaled for {servings})</span>
            )}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {scaledIngredients.map((ing, i) => {
              const hasIt = userIngredients.some((ui) => ui.toLowerCase() === ing.name.toLowerCase())
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
                    <img src={getIngredientThumb(ing.name)} alt={ing.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${hasIt ? 'text-emerald-400' : 'text-foreground'}`}>{ing.name}</p>
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
            <h2 className="font-heading text-xl font-bold text-foreground">Instructions</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{completedSteps.size}/{steps.length} done</span>
              <button
                onClick={enterCookMode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/30"
              >
                <Maximize2 size={12} />
                Cook mode
              </button>
            </div>
          </div>

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
                <motion.div key={i} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.02 }}>
                  <button
                    onClick={() => toggleStep(i)}
                    className={`flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all ${
                      done ? 'bg-emerald-500/5 ring-1 ring-emerald-500/10' : 'bg-card ring-1 ring-foreground/5 hover:ring-amber-500/20'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {done ? <Check size={14} /> : i + 1}
                    </span>
                    <span className={`text-sm leading-relaxed ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3">
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
