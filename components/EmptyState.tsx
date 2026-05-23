'use client'

import Link from 'next/link'
import { ChefHat, SearchX, HeartOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type?: 'no-ingredients' | 'no-results' | 'no-favorites' | 'error'
  message?: string
  action?: { label: string; href: string }
}

const ICONS = {
  'no-ingredients': ChefHat,
  'no-results': SearchX,
  'no-favorites': HeartOff,
  error: AlertTriangle,
} as const

const MESSAGES = {
  'no-ingredients': 'Add some ingredients to find recipes',
  'no-results': 'No recipes found with those ingredients. Try removing one.',
  'no-favorites': 'No saved recipes yet. Start searching!',
  error: 'Something went wrong. Please try again.',
} as const

export function EmptyState({
  type = 'no-results',
  message,
  action,
}: EmptyStateProps) {
  const Icon = ICONS[type]
  const defaultMessage = MESSAGES[type]

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">
        {message ?? defaultMessage}
      </p>
      {action && (
        <Link href={action.href}>
          <Button variant="outline">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
