'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Compass, Bookmark, X, AlertTriangle, Sun } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { IngredientInput } from '@/components/IngredientInput'
import { RecipeGrid } from '@/components/RecipeGrid'
import { SurpriseMeButton } from '@/components/SurpriseMeButton'
import { useIngredients } from '@/hooks/useIngredients'
import { useMealSearch } from '@/hooks/useMealSearch'
import { useDailyMeals } from '@/hooks/useDailyMeals'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/AuthProvider'
import { auth } from '@/lib/firebase'
import { usePantry } from '@/hooks/usePantry'
import { useSavedSearches } from '@/hooks/useSavedSearches'
import { getCurrentSeasonalIngredients } from '@/data/seasonal'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { ingredients, addIngredient, clearAll } = useIngredients()
  const { meals, isLoading, isLoadingMore, error, hasMore, loadMore } = useMealSearch(ingredients)
  const { meals: dailyMeals, isLoading: dailyLoading } = useDailyMeals()
  const { expiringItems } = usePantry()
  const { searches, saveSearch, deleteSearch } = useSavedSearches()
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [searchName, setSearchName] = useState('')
  const expiring = expiringItems(3)
  const seasonal = getCurrentSeasonalIngredients()

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.replace('/auth')
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  return (
    <>
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 space-y-2"
        >
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Fridge Raid
          </h1>
          <p className="text-base text-muted-foreground">
            Pick ingredients. Find recipes. Cook.
          </p>
        </motion.section>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <Link
            href="/continents"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-card px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-amber-500/40 hover:text-foreground"
          >
            <Compass size={16} className="text-amber-500" />
            Explore cuisines by continent
          </Link>
          <SurpriseMeButton meals={meals} ingredients={ingredients} />
        </motion.div>

        {/* Food of the Day */}
        {!dailyLoading && dailyMeals.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-12"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <h2 className="font-heading text-lg font-bold text-foreground">
                Food of the Day
              </h2>
              <span className="text-xs text-muted-foreground">
                — updated daily
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {dailyMeals.map((meal, i) => (
                <Link key={meal.idMeal} href={`/recipe/${meal.idMeal}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                    className="group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 hover:ring-amber-500/20"
                  >
                    <div className="relative aspect-[2/1] sm:aspect-[3/2]">
                      <Image
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="mb-1.5 flex flex-wrap gap-1.5">
                          {meal.strCategory && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                              {meal.strCategory}
                            </span>
                          )}
                          {meal.strArea && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              {meal.strArea}
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-amber-300 transition-colors line-clamp-1">
                          {meal.strMeal}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {dailyLoading && (
          <div className="mb-12">
            <Skeleton className="mb-4 h-6 w-36" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/1] rounded-xl sm:aspect-[3/2]" />
              ))}
            </div>
          </div>
        )}

        {/* Use it up */}
        {expiring.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Link
              href="/pantry"
              className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 transition-all hover:bg-amber-500/10"
            >
              <AlertTriangle size={18} className="text-amber-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-300">{expiring.length} item{expiring.length !== 1 ? 's' : ''} expiring soon</p>
                <p className="text-xs text-muted-foreground">Check your pantry and use them up</p>
              </div>
              <span className="text-xs text-amber-500">&rarr;</span>
            </Link>
          </motion.div>
        )}

        {/* Seasonal */}
        {seasonal.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <Sun size={14} className="text-amber-500" />
            <span className="text-xs text-muted-foreground">In season now:</span>
            {seasonal.slice(0, 8).map((item) => (
              <button
                key={item}
                onClick={() => addIngredient(item)}
                className="rounded-full bg-card px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-foreground/10 transition-all hover:border-amber-500/30 hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}

        {/* Ingredient input */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mb-6"
        >
          <IngredientInput />
        </motion.section>

        {/* Saved searches */}
        {searches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <Bookmark size={12} className="text-muted-foreground" />
            {searches.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  clearAll()
                  s.ingredients.forEach((i) => addIngredient(i))
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-card px-3 py-1 text-xs text-muted-foreground transition-all hover:border-amber-500/30 hover:text-foreground"
              >
                {s.name}
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSearch(s.id)
                  }}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] hover:bg-red-500/20 hover:text-red-400"
                >
                  <X size={9} />
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Save search / clear */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
          className="mb-10 flex flex-wrap items-center gap-3"
        >
          {ingredients.length > 0 && (
            <>
              <button
                onClick={() => setShowSaveSearch(!showSaveSearch)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bookmark size={12} />
                Save search
              </button>
              <button onClick={clearAll} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Clear all
              </button>
            </>
          )}
          <AnimatePresence>
            {showSaveSearch && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex gap-2 overflow-hidden"
              >
                <input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search name..."
                  className="h-7 w-36 rounded-lg border border-foreground/10 bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchName.trim()) {
                      saveSearch(searchName.trim(), ingredients)
                      setSearchName('')
                      setShowSaveSearch(false)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (searchName.trim()) {
                      saveSearch(searchName.trim(), ingredients)
                      setSearchName('')
                      setShowSaveSearch(false)
                    }
                  }}
                  className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30"
                >
                  Save
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recipe grid */}
        <section>
          {meals.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-xs text-muted-foreground"
            >
              {ingredients.length > 0
                ? `Showing matching and suggested recipes for your ingredients`
                : 'Infinite recipe inspiration'}
            </motion.p>
          )}
          <RecipeGrid
            meals={meals}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            hasMore={hasMore}
            hasIngredients={ingredients.length > 0}
            onLoadMore={loadMore}
          />
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground/50">
          Powered by TheMealDB
        </footer>
      </main>
    </>
  )
}
