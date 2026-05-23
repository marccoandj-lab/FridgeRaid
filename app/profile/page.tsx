'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, LogOut, ChefHat, Calendar, IceCream } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/lib/AuthProvider'
import { useFavorites } from '@/hooks/useFavorites'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logOut, isLoading } = useAuth()
  const { favorites } = useFavorites()

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth')
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  const created = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/20">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User size={32} className="text-amber-400" />
            )}
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
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
          className="mb-8 grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl border border-amber-500/10 bg-card p-4 text-center">
            <ChefHat size={20} className="mx-auto mb-1.5 text-amber-500" />
            <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">Saved recipes</p>
          </div>
          <div className="rounded-xl border border-amber-500/10 bg-card p-4 text-center">
            <IceCream size={20} className="mx-auto mb-1.5 text-amber-500" />
            <p className="text-2xl font-bold text-foreground">∞</p>
            <p className="text-xs text-muted-foreground">Recipes to explore</p>
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 transition-all hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>
      </main>
    </>
  )
}
