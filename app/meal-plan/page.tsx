'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight, Trash2, Sun, Moon, Sunrise, Cookie } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { useMealPlan, type MealPlanEntry } from '@/hooks/useMealPlan'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthProvider'
import { auth } from '@/lib/firebase'

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Sunrise size={14} />,
  lunch: <Sun size={14} />,
  dinner: <Moon size={14} />,
  snack: <Cookie size={14} />,
}

const MEAL_TYPES: MealPlanEntry["mealType"][] = ["breakfast", "lunch", "dinner", "snack"]

function getWeekDates(start: Date): string[] {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

export default function MealPlanPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { plan, addToPlan, removeFromPlan } = useMealPlan()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [newRecipe, setNewRecipe] = useState<{ date: string; mealType: MealPlanEntry["mealType"] } | null>(null)
  const [recipeName, setRecipeName] = useState("")
  const [recipeId, setRecipeId] = useState("")

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.replace('/auth')
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  const weekDates = getWeekDates(weekStart)
  const today = new Date().toISOString().split("T")[0]

  const dayNames = weekDates.map((date) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "")
  })

  const addRecipe = () => {
    if (!recipeName.trim() || !newRecipe) return
    addToPlan({
      date: newRecipe.date,
      mealType: newRecipe.mealType,
      recipeId: recipeId || `custom-${Date.now()}`,
      recipeName: recipeName.trim(),
    })
    setRecipeName("")
    setRecipeId("")
    setNewRecipe(null)
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Meal Plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Plan your week ahead</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekStart(getMonday(new Date()))} className="rounded-lg bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground">Today</button>
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground">
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>

        {plan.length === 0 && !newRecipe && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 bg-card/50 py-20 text-center">
            <CalendarDays size={48} className="mb-4 text-amber-500/30" />
            <p className="font-heading text-lg font-bold text-foreground">No meals planned</p>
            <p className="mt-1 text-sm text-muted-foreground">Click a meal slot to add a recipe</p>
          </motion.div>
        )}

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, di) => (
            <div key={date}>
              <div className={`mb-2 text-center text-xs font-medium ${date === today ? 'text-amber-400' : 'text-muted-foreground'}`}>
                {dayNames[di]}
              </div>
              <div className="space-y-1.5">
                {MEAL_TYPES.map((mealType) => {
                  const entry = plan.find((p) => p.date === date && p.mealType === mealType)
                  return (
                    <div
                      key={mealType}
                      onClick={() => setNewRecipe({ date, mealType })}
                      className={`min-h-[60px] cursor-pointer rounded-lg p-1.5 text-left text-[10px] transition-all ${
                        entry ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-card ring-1 ring-foreground/5 hover:ring-amber-500/20'
                      }`}
                    >
                      {entry ? (
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0 flex-1">
                            <Link href={`/recipe/${entry.recipeId}`} className="text-[10px] font-medium text-foreground hover:text-amber-300 line-clamp-2" onClick={(e) => e.stopPropagation()}>
                              {entry.recipeName}
                            </Link>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromPlan(date, mealType) }}
                            className="shrink-0 text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 size={9} />
                          </button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] text-muted-foreground/50">
                          {MEAL_ICONS[mealType]}
                          {mealType}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add recipe modal */}
        {newRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setNewRecipe(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-2xl border border-amber-500/20 bg-card p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-1 font-heading text-lg font-bold text-foreground">Add to Meal Plan</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                {newRecipe.date === today ? "Today" : new Date(newRecipe.date).toLocaleDateString("en-US", { weekday: "long" })} — {newRecipe.mealType}
              </p>
              <div className="space-y-3">
                <input
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Recipe name"
                  className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && addRecipe()}
                />
                <input
                  value={recipeId}
                  onChange={(e) => setRecipeId(e.target.value)}
                  placeholder="Recipe ID (optional)"
                  className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setNewRecipe(null)} className="flex-1 rounded-xl border border-foreground/10 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
                  <button onClick={addRecipe} className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-amber-400">Add</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </>
  )
}
