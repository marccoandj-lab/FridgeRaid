'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Plus, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { useCookbookRecipes } from '@/hooks/useCookbookRecipes'
import { useAuth } from '@/lib/AuthProvider'
import { auth } from '@/lib/firebase'

type Tab = 'meals' | 'custom'

interface MealResult {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

export default function AddRecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addRecipe } = useCookbookRecipes(id)

  const [tab, setTab] = useState<Tab>('meals')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<MealResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.push('/auth')
  }, [authLoading, user, router])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    let cancelled = false
    setSearching(true)
    setSearched(false)
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setResults(data.meals || [])
        setSearched(true)
        setSearching(false)
      })
      .catch(() => {
        if (cancelled) return
        setResults([])
        setSearched(true)
        setSearching(false)
      })
    return () => { cancelled = true }
  }, [debouncedQuery])

  const handleAddMeal = useCallback(async (meal: MealResult) => {
    setAdding(meal.idMeal)
    await addRecipe({ type: 'meal', idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb })
    router.push(`/cookbooks/${id}`)
  }, [addRecipe, id, router])

  const handleSubmitCustom = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    await addRecipe({
      type: 'custom',
      name: name.trim(),
      ingredients: ingredients.split('\n').map((s) => s.trim()).filter(Boolean),
      instructions: instructions.trim(),
      imageUrl: imageUrl.trim() || undefined,
    })
    router.push(`/cookbooks/${id}`)
  }, [addRecipe, id, router, name, ingredients, instructions, imageUrl])

  if (authLoading || !user) return null

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        <Link
          href={`/cookbooks/${id}`}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Cookbook
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Add Recipe
          </h1>
          <p className="mt-2 text-muted-foreground">
            Search TheMealDB or create your own custom recipe.
          </p>
        </motion.div>

        <div className="mb-8 flex gap-1.5 rounded-xl bg-card p-1.5 ring-1 ring-foreground/5">
          {(['meals', 'custom'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'meals' ? 'From Meals' : 'Custom Recipe'}
            </button>
          ))}
        </div>

        {tab === 'meals' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search meals..."
                className="w-full rounded-xl border border-foreground/10 bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-amber-500" />
              </div>
            )}

            {!searching && searched && results.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No meals found
              </p>
            )}

            {!searching && results.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {results.map((meal) => (
                  <button
                    key={meal.idMeal}
                    onClick={() => handleAddMeal(meal)}
                    disabled={adding === meal.idMeal}
                    className="group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 transition-all hover:ring-amber-500/30 active:scale-[0.97]"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2.5 text-left">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {meal.strMeal}
                      </p>
                    </div>
                    {adding === meal.idMeal && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Loader2 size={20} className="animate-spin text-amber-500" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <Plus size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitCustom} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Recipe Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grandma's Lasagna"
                required
                className="w-full rounded-xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Ingredients (one per line)
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="1 lb ground beef&#10;2 cups shredded mozzarella&#10;1 jar marinara sauce"
                rows={5}
                required
                className="w-full resize-none rounded-xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Step-by-step cooking instructions..."
                rows={6}
                required
                className="w-full resize-none rounded-xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Image URL <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/recipe.jpg"
                className="w-full rounded-xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Add to Cookbook
            </button>
          </form>
        )}
      </main>
    </>
  )
}
