'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Globe } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { RecipeCard } from '@/components/RecipeCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CONTINENT_AREAS, fetchMealsByArea } from '@/lib/mealdb'
import type { MealSummary } from '@/types/meal'

const WorldMap = dynamic(() => import('@/components/WorldMap').then((m) => m.WorldMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[55vh] min-h-[340px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
    </div>
  ),
})

const CONTINENTS = Object.keys(CONTINENT_AREAS) as (keyof typeof CONTINENT_AREAS)[]

const CONTINENT_META: Record<string, { color: string; hoverColor: string; labelColor: string; coords: [number, number]; emblem: string }> = {
  Africa: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.72 0.16 65 / 0.5)', labelColor: 'oklch(0.72 0.16 65)', coords: [20, 5], emblem: '🌍' },
  Asia: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.65 0.12 45 / 0.5)', labelColor: 'oklch(0.65 0.12 45)', coords: [90, 35], emblem: '🌏' },
  Europe: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.7 0.1 200 / 0.5)', labelColor: 'oklch(0.7 0.1 200)', coords: [20, 55], emblem: '🌍' },
  'North America': { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.68 0.14 30 / 0.5)', labelColor: 'oklch(0.68 0.14 30)', coords: [-100, 40], emblem: '🌎' },
  'South America': { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.62 0.13 150 / 0.5)', labelColor: 'oklch(0.62 0.13 150)', coords: [-60, -15], emblem: '🌎' },
  Oceania: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.65 0.1 280 / 0.5)', labelColor: 'oklch(0.65 0.1 280)', coords: [135, -25], emblem: '🌏' },
}

export default function ContinentsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [meals, setMeals] = useState<MealSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null)
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null)

  const handleContinentClick = useCallback(async (continent: string) => {
    setSelectedContinent(continent)
    setSelected(continent)
    setIsLoading(true)
    setMeals([])

    const areas = CONTINENT_AREAS[continent]
    const batchSize = 10
    const all: MealSummary[] = []
    const seen = new Set<string>()

    for (let i = 0; i < areas.length; i += batchSize) {
      const batch = areas.slice(i, i + batchSize)
      const results = await Promise.all(batch.map((a) => fetchMealsByArea(a)))
      for (const meals of results) {
        for (const m of meals) {
          if (!seen.has(m.idMeal)) {
            seen.add(m.idMeal)
            all.push(m)
          }
        }
      }
    }
    setMeals(all)
    setIsLoading(false)
  }, [])

  const handleBack = useCallback(() => {
    setSelected(null)
    setSelectedContinent(null)
    setMeals([])
  }, [])

  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[calc(100dvh-56px)] flex-col">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative z-10 flex-1 overflow-y-auto px-4 py-6"
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={16} />
                Back to map
              </Button>

              <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                  {selectedContinent}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isLoading ? 'Gathering recipes...' : `${meals.length} recipes to explore`}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                      <Skeleton className="aspect-square w-full rounded-none" />
                      <div className="space-y-2 p-3">
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : meals.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.03 } },
                  }}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                >
                  {meals.map((meal) => (
                    <motion.div
                      key={meal.idMeal}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <RecipeCard meal={meal} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No recipes found for this continent.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {/* Map section */}
              <WorldMap
                hoveredContinent={hoveredContinent}
                setHoveredContinent={setHoveredContinent}
                onContinentClick={handleContinentClick}
              />

              {/* Continent cards section */}
              <div className="bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
                <div className="mx-auto max-w-7xl px-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {CONTINENTS.map((continent) => {
                      const meta = CONTINENT_META[continent]
                      const areaCount = CONTINENT_AREAS[continent].length
                      const isHovered = hoveredContinent === continent
                      return (
                        <motion.button
                          key={continent}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleContinentClick(continent)}
                          onMouseEnter={() => setHoveredContinent(continent)}
                          onMouseLeave={() => setHoveredContinent(null)}
                          className="group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all duration-300"
                          style={{
                            borderColor: isHovered
                              ? meta?.labelColor + ' / 0.4'
                              : 'oklch(1 0 0 / 0.06)',
                            boxShadow: isHovered
                              ? `0 0 30px ${meta?.labelColor ?? 'oklch(0.72 0.16 65)'} / 0.1`
                              : 'none',
                          }}
                        >
                          <span className="mb-2 block text-2xl">{meta?.emblem ?? '🌍'}</span>
                          <h3 className="font-heading text-sm font-bold text-foreground transition-colors group-hover:text-amber-300">
                            {continent}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {areaCount} cuisines
                          </p>
                          <div
                            className="mt-2 h-1 w-8 rounded-full transition-all duration-300 group-hover:w-full"
                            style={{ backgroundColor: meta?.labelColor ?? 'oklch(0.5 0 0)' }}
                          />
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Floating legend chips */}
              <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 sm:block">
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/10 bg-background/60 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl">
                  <Globe size={10} />
                  <span>Click any highlighted region</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
