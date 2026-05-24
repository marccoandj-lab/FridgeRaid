'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Copy, Check } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { CookbookRecipeCard } from '@/components/CookbookRecipeCard'
import { CookbookMemberBadge } from '@/components/CookbookMemberBadge'
import { EmptyState } from '@/components/EmptyState'
import { useCookbookRecipes } from '@/hooks/useCookbookRecipes'
import { useCookbookMembers } from '@/hooks/useCookbookMembers'
import { useAuth } from '@/lib/AuthProvider'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { Cookbook } from '@/types/cookbook'

type FilterType = 'all' | 'meal' | 'custom'

export default function CookbookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [cookbook, setCookbook] = useState<Cookbook | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [copied, setCopied] = useState(false)

  const { recipes, isLoading: recipesLoading, removeRecipe, toggleLike } = useCookbookRecipes(id)
  const { members, isLoading: membersLoading } = useCookbookMembers(id)

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.push('/auth')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'cookbooks', id))
        if (snap.exists()) setCookbook({ id: snap.id, ...snap.data() } as Cookbook)
      } catch (e) {
        console.error('Failed to fetch cookbook:', e)
      }
    })()
  }, [id])

  const handleCopyInvite = async () => {
    if (!cookbook) return
    try {
      await navigator.clipboard.writeText(cookbook.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy invite code:', e)
    }
  }

  const filteredRecipes = filter === 'all'
    ? recipes
    : recipes.filter((r) => r.type === filter)

  if (authLoading || !user) return null

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8">
        <Link
          href="/cookbooks"
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Cookbooks
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {cookbook ? (
            <>
              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                {cookbook.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  {(membersLoading ? [] : members).map((m) => (
                    <CookbookMemberBadge key={m.id} name={m.displayName} size="sm" />
                  ))}
                </div>
                <button
                  onClick={handleCopyInvite}
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-400 transition-all hover:bg-amber-500/10"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : `Invite: ${cookbook.inviteCode}`}
                </button>
              </div>
            </>
          ) : (
            <div className="h-8 w-48 animate-pulse rounded-lg bg-card ring-1 ring-foreground/5" />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex gap-2"
        >
          {(['all', 'meal', 'custom'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-card text-muted-foreground ring-1 ring-foreground/5 hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f === 'meal' ? 'MealDB' : 'Custom'}
            </button>
          ))}
        </motion.div>

        {recipesLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-card ring-1 ring-foreground/5"
              />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <EmptyState
            type="no-results"
            message={
              filter === 'all'
                ? 'No recipes in this cookbook yet'
                : `No ${filter === 'meal' ? 'MealDB' : 'Custom'} recipes in this cookbook`
            }
            action={{ label: 'Add recipe', href: `/cookbooks/${id}/add` }}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: index * 0.04,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <CookbookRecipeCard
                    recipe={recipe}
                    isLiked={recipe.likes.includes(user.uid)}
                    currentUserId={user.uid}
                    onLike={toggleLike}
                    onDelete={removeRecipe}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Link
        href={`/cookbooks/${id}/add`}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95"
      >
        <Plus size={24} />
      </Link>
    </>
  )
}
