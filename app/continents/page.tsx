'use client'

import { useState, useCallback, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComposableMap, Geographies, Geography, ZoomableGroup, Marker,
} from 'react-simple-maps'
import { ChevronLeft, Globe } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { RecipeCard } from '@/components/RecipeCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CONTINENT_AREAS, fetchMealsByArea } from '@/lib/mealdb'
import type { MealSummary } from '@/types/meal'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const CONTINENTS = Object.keys(CONTINENT_AREAS) as (keyof typeof CONTINENT_AREAS)[]

const CONTINENT_META: Record<string, { color: string; hoverColor: string; labelColor: string; coords: [number, number]; emblem: string }> = {
  Africa: {
    color: 'oklch(0.92 0.01 60 / 0.6)',
    hoverColor: 'oklch(0.72 0.16 65 / 0.5)',
    labelColor: 'oklch(0.72 0.16 65)',
    coords: [20, 5],
    emblem: '🌍',
  },
  Asia: {
    color: 'oklch(0.92 0.01 60 / 0.6)',
    hoverColor: 'oklch(0.65 0.12 45 / 0.5)',
    labelColor: 'oklch(0.65 0.12 45)',
    coords: [90, 35],
    emblem: '🌏',
  },
  Europe: {
    color: 'oklch(0.92 0.01 60 / 0.6)',
    hoverColor: 'oklch(0.7 0.1 200 / 0.5)',
    labelColor: 'oklch(0.7 0.1 200)',
    coords: [20, 55],
    emblem: '🌍',
  },
  'North America': {
    color: 'oklch(0.92 0.01 60 / 0.6)',
    hoverColor: 'oklch(0.68 0.14 30 / 0.5)',
    labelColor: 'oklch(0.68 0.14 30)',
    coords: [-100, 40],
    emblem: '🌎',
  },
  'South America': {
    color: 'oklch(0.92 0.01 60 / 0.6)',
    hoverColor: 'oklch(0.62 0.13 150 / 0.5)',
    labelColor: 'oklch(0.62 0.13 150)',
    coords: [-60, -15],
    emblem: '🌎',
  },
  Oceania: {
    color: 'oklch(0.92 0.01 60 / 0.6)',
    hoverColor: 'oklch(0.65 0.1 280 / 0.5)',
    labelColor: 'oklch(0.65 0.1 280)',
    coords: [135, -25],
    emblem: '🌏',
  },
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
              <div className="relative" style={{ height: '55vh', minHeight: '340px' }}>
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 140, center: [15, 30] }}
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as CSSProperties}
                >
                  <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo, i) => {
                          const continent = geo.properties?.continent
                          const isHovered = hoveredContinent === continent
                          const meta = continent ? CONTINENT_META[continent] : null
                          return (
                            <Geography
                              key={`${geo.rsmKey}-${i}`}
                              geography={geo}
                              onClick={() => {
                                if (continent && CONTINENT_AREAS[continent]) {
                                  handleContinentClick(continent)
                                }
                              }}
                              onMouseEnter={() => {
                                if (continent) setHoveredContinent(continent)
                              }}
                              onMouseLeave={() => setHoveredContinent(null)}
                              style={{
                                default: {
                                  fill: isHovered && meta
                                    ? meta.hoverColor
                                    : meta
                                      ? 'oklch(0.28 0.02 60)'
                                      : 'oklch(0.20 0.01 60)',
                                  stroke: isHovered && meta
                                    ? meta.labelColor
                                    : 'oklch(1 0 0 / 0.12)',
                                  strokeWidth: isHovered ? 1.2 : 0.5,
                                  outline: 'none',
                                  transition: 'all 0.2s ease',
                                },
                                hover: {
                                  fill: meta ? meta.hoverColor : 'oklch(0.72 0.16 65 / 0.5)',
                                  stroke: meta ? meta.labelColor : 'oklch(0.72 0.16 65 / 0.6)',
                                  strokeWidth: 1.5,
                                  outline: 'none',
                                  cursor: continent && CONTINENT_AREAS[continent] ? 'pointer' : 'default',
                                },
                                pressed: {
                                  fill: meta ? meta.hoverColor : 'oklch(0.72 0.16 65 / 0.4)',
                                  outline: 'none',
                                },
                              }}
                            />
                          )
                        })
                      }
                    </Geographies>

                    {/* Continent name labels */}
                    {CONTINENTS.map((name) => {
                      const meta = CONTINENT_META[name]
                      if (!meta) return null
                      const isHovered = hoveredContinent === name
                      return (
                        <Marker key={name} coordinates={meta.coords}>
                          <text
                            textAnchor="middle"
                            fontSize={isHovered ? 15 : 12}
                            fontWeight={700}
                            fontFamily="var(--font-heading)"
                            fill={isHovered ? meta.labelColor : 'oklch(0.92 0.01 60 / 0.5)'}
                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            onClick={() => handleContinentClick(name)}
                          >
                            {name}
                          </text>
                        </Marker>
                      )
                    })}
                  </ZoomableGroup>
                </ComposableMap>

                {/* Header overlay */}
                <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-background via-background/70 to-transparent pb-16 pt-4">
                  <div className="pointer-events-auto mx-auto max-w-7xl px-4">
                    <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                      Explore by Continent
                    </h1>
                    <p className="mt-1 text-base text-muted-foreground">
                      Click a country or card to discover its cuisine
                    </p>
                  </div>
                </div>
              </div>

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
