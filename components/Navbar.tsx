'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Heart, IceCream, Compass, User, LayoutList, BookOpen, Refrigerator, ShoppingCart, CalendarDays, ChefHat } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/lib/AuthProvider'
import { cn } from '@/lib/utils'

const topNavLinks = [
  { href: '/categories', label: 'Categories', icon: LayoutList },
  { href: '/continents', label: 'Explore', icon: Compass },
  { href: '/pantry', label: 'Pantry', icon: Refrigerator },
]

const bottomNavLinks = [
  { href: '/', label: 'Home', icon: ChefHat },
  { href: '/favorites', label: 'Saved', icon: Heart },
  { href: '/shopping-list', label: 'Shopping', icon: ShoppingCart },
  { href: '/meal-plan', label: 'Plan', icon: CalendarDays },
  { href: '/cookbooks', label: 'Cookbooks', icon: BookOpen },
]

export function Navbar() {
  const pathname = usePathname()
  const { favorites } = useFavorites()
  const { user, isLoading } = useAuth()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Top navbar — hidden on mobile, visible sm+ */}
      <nav className="sticky top-0 z-50 hidden border-b border-amber-500/10 bg-background/80 px-4 py-3 backdrop-blur-xl sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <IceCream size={22} className="text-primary" />
            <span className="font-heading text-lg font-bold text-foreground">
              Fridge Raid
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {topNavLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 text-sm transition-colors',
                  isActive(href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              href="/favorites"
              className={cn(
                'relative flex items-center gap-1.5 text-sm transition-colors',
                isActive('/favorites') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Heart size={18} />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {favorites.length}
                </span>
              )}
            </Link>
            {!isLoading && (
              <Link
                href={user ? '/profile' : '/auth'}
                className={cn(
                  'flex items-center gap-1.5 text-sm transition-colors',
                  isActive('/profile') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <User size={18} />
                <span>{user ? 'Profile' : 'Sign In'}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom tab nav — visible on mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-500/10 bg-background/90 backdrop-blur-xl sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around">
          {bottomNavLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 transition-colors',
                  active ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon size={20} />
                  {href === '/favorites' && favorites.length > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-[3px] text-[8px] font-medium text-primary-foreground">
                      {favorites.length > 9 ? '9+' : favorites.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Top mobile bar with brand */}
      <div className="sticky top-0 z-40 border-b border-amber-500/10 bg-background/80 px-4 py-2.5 backdrop-blur-xl sm:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <IceCream size={20} className="text-primary" />
            <span className="font-heading text-base font-bold text-foreground">Fridge Raid</span>
          </Link>
          {!isLoading && (
            <Link
              href={user ? '/profile' : '/auth'}
              className={cn(
                'flex items-center gap-1 text-sm transition-colors',
                isActive('/profile') ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <User size={18} />
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
