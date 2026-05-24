'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { useMealPlan } from '@/hooks/useMealPlan'
import type { MealPlanEntry } from '@/hooks/useMealPlan'

interface MealPlanPickerProps {
  recipeId: string
  recipeName: string
  recipeThumb: string
}

export function MealPlanPicker({ recipeId, recipeName, recipeThumb }: MealPlanPickerProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [mealType, setMealType] = useState<MealPlanEntry['mealType']>('dinner')
  const { addToPlan } = useMealPlan()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <CalendarDays size={14} />
        Add to meal plan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-amber-500/20 bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 font-heading text-lg font-bold text-foreground">Add to Meal Plan</h3>
            <p className="mb-4 text-xs text-muted-foreground">{recipeName}</p>
            <div className="space-y-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground focus:border-amber-500/40 focus:outline-none"
              />
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealPlanEntry['mealType'])}
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm text-foreground focus:border-amber-500/40 focus:outline-none"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-foreground/10 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (date) {
                      addToPlan({ date, mealType, recipeId, recipeName, recipeThumb })
                      setOpen(false)
                    }
                  }}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-amber-400"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
