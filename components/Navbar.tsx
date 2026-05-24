'use client'

import Link from 'next/link'
import { Heart, IceCream, Compass, User, LayoutList, BookOpen, CalendarDays } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/lib/AuthProvider'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { favorites } = useFavorites()
  const { user, isLoading } = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-500/10 bg-background/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <IceCream size={22} className="text-primary" />
          <span className="hidden font-heading text-lg font-bold text-foreground sm:inline">
            Fridge Raid
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/categories"
            className={cn(
              'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            <LayoutList size={18} />
            <span className="hidden sm:inline">Kategorije</span>
          </Link>
          <Link
            href="/continents"
            className={cn(
              'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            <Compass size={18} />
            <span className="hidden sm:inline">Istraži</span>
          </Link>
          <Link
            href="/favorites"
            className={cn(
              'relative flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            <Heart size={18} />
            <span className="hidden sm:inline">Omiljeni</span>
            {favorites.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            href="/meal-plan"
            className={cn(
              'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            <CalendarDays size={18} />
            <span className="hidden sm:inline">Planer</span>
          </Link>
          <Link
            href="/cookbooks"
            className={cn(
              'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            <BookOpen size={18} />
            <span className="hidden sm:inline">Kuvarice</span>
          </Link>
          {!isLoading && (
            <Link
              href={user ? '/profile' : '/auth'}
              className={cn(
                'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
              )}
            >
              <User size={18} />
              <span className="hidden sm:inline">{user ? 'Profil' : 'Prijava'}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
