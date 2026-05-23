'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface IngredientTagProps {
  name: string
  color: string
  onRemove: () => void
}

export function IngredientTag({ name, color, onRemove }: IngredientTagProps) {
  return (
    <motion.span
      layout
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${color}`}
    >
      {name}
      <button
        onClick={onRemove}
        className="transition-opacity hover:opacity-70"
        aria-label={`Remove ${name}`}
      >
        <X size={12} />
      </button>
    </motion.span>
  )
}
