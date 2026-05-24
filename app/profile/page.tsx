'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, LogOut, ChefHat, Calendar, IceCream, Flame, Sun, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { auth } from '@/lib/firebase'
import { useFavorites } from '@/hooks/useFavorites'
import { useCookingStreaks } from '@/hooks/useCookingStreaks'
import { useDietaryPreferences, DIET_OPTIONS } from '@/hooks/useDietaryPreferences'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logOut, isLoading } = useAuth()
  const { favorites } = useFavorites()
  const { currentStreak, longestStreak, totalCooked } = useCookingStreaks()
  const { diets, toggleDiet } = useDietaryPreferences()

  useEffect(() => {
    if (!isLoading && !user && !auth.currentUser) router.push('/auth')
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  const created = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col items-center text-center sm:mb-8"
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/20">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <User size={32} className="text-amber-400" />
          )}
        </div>
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          {user.displayName || 'Chef'}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail size={14} />
          {user.email}
        </p>
        {created && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Calendar size={12} />
            Member since {created}
          </p>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 grid grid-cols-4 gap-2 sm:mb-8 sm:gap-3"
      >
        {[
          { icon: ChefHat, label: 'Saved', value: favorites.length },
          { icon: Flame, label: 'Day streak', value: currentStreak },
          { icon: Sun, label: 'Best streak', value: longestStreak },
          { icon: UtensilsCrossed, label: 'Cooked', value: totalCooked },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-amber-500/10 bg-card p-3 text-center">
            <Icon size={18} className="mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Dietary Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="mb-3 font-heading text-sm font-bold text-foreground">Dietary Preferences</h2>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((diet) => {
            const active = diets.includes(diet.id)
            return (
              <button
                key={diet.id}
                onClick={() => toggleDiet(diet.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.96] ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground'
                }`}
              >
                {diet.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <button
          onClick={async () => {
            await logOut()
            router.push('/')
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.98]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </motion.div>
    </main>
  )
}
