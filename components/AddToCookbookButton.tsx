'use client'

import { useState, useRef, useEffect } from 'react'
import { BookOpen, Check, Loader2, BookPlus, Ban } from 'lucide-react'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthProvider'
import { useCookbooks } from '@/hooks/useCookbooks'
import { cn } from '@/lib/utils'

interface AddToCookbookButtonProps {
  mealId: string
  mealName: string
  mealThumb: string
  className?: string
  size?: 'sm' | 'md'
}

export function AddToCookbookButton({
  mealId,
  mealName,
  mealThumb,
  className,
  size = 'sm',
}: AddToCookbookButtonProps) {
  const { user } = useAuth()
  const { cookbooks, isLoading } = useCookbooks()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set())
  const [checkingExisting, setCheckingExisting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Query which cookbooks already have this recipe when dropdown opens
  useEffect(() => {
    if (!open) return
    const fetchExisting = async () => {
      setCheckingExisting(true)
      try {
        const q = query(collection(db, 'cookbookRecipes'), where('idMeal', '==', mealId))
        const snapshot = await getDocs(q)
        setExistingIds(new Set(snapshot.docs.map((d) => d.data().cookbookId)))
      } catch (e) {
        console.error('Failed to check existing recipes:', e)
      } finally {
        setCheckingExisting(false)
      }
    }
    fetchExisting()
  }, [open, mealId])

  const getCompositeId = (cookbookId: string) => `${cookbookId}_meal_${mealId}`

  const handleAdd = async (cookbookId: string) => {
    if (!user) return
    setAdding(cookbookId)
    try {
      const ref = doc(db, 'cookbookRecipes', getCompositeId(cookbookId))
      const data = {
        cookbookId,
        addedBy: user.uid,
        type: 'meal' as const,
        idMeal: mealId,
        strMeal: mealName,
        strMealThumb: mealThumb,
        likes: [],
        addedAt: Date.now(),
      }
      await setDoc(ref, data)
      setAdded(cookbookId)
      setExistingIds((prev) => new Set(prev).add(cookbookId))
      setTimeout(() => { setAdded(null); setOpen(false) }, 1200)
    } catch (e) {
      console.error('Failed to add recipe:', e)
    } finally {
      setAdding(null)
    }
  }

  const buttonSize = size === 'md' ? 'h-10 w-10' : 'h-8 w-8'
  const iconSize = size === 'md' ? 16 : 14

  return (
    <div ref={dropdownRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(!open)
        }}
        aria-label="Add to cookbook"
        className={cn(
          `flex ${buttonSize} items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70`,
          open && 'bg-amber-500/30 ring-1 ring-amber-500/40',
          className
        )}
      >
        <BookPlus size={iconSize} className="text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-52 overflow-hidden rounded-xl border border-amber-500/10 bg-card shadow-2xl shadow-amber-500/5"
          >
            <div className="border-b border-amber-500/10 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Add to cookbook</p>
            </div>

            <div className="max-h-48 overflow-y-auto p-1">
              {isLoading || checkingExisting ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                </div>
              ) : cookbooks.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No cookbooks yet — create one first
                </p>
              ) : (
                cookbooks.map((cb) => {
                  const isExisting = existingIds.has(cb.id)
                  const isAdding = adding === cb.id
                  const isAdded = added === cb.id
                  return (
                    <button
                      key={cb.id}
                      onClick={() => handleAdd(cb.id)}
                      disabled={isExisting || isAdding || isAdded}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-amber-500/10 disabled:opacity-50"
                    >
                      <BookOpen
                        size={14}
                        className={cn(
                          'shrink-0',
                          isExisting ? 'text-muted-foreground' : 'text-amber-500',
                        )}
                      />
                      <span className="flex-1 truncate">{cb.name}</span>
                      {isExisting && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Ban size={10} />
                          Already added
                        </span>
                      )}
                      {isAdded && <Check size={14} className="shrink-0 text-emerald-400" />}
                      {isAdding && <Loader2 size={14} className="shrink-0 animate-spin text-amber-500" />}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}