'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const COMMON_INGREDIENTS = [
  'Chicken', 'Garlic', 'Onion', 'Tomato', 'Rice', 'Pasta', 'Egg',
  'Butter', 'Olive oil', 'Salt', 'Pepper', 'Lemon', 'Cheese',
  'Milk', 'Flour', 'Sugar', 'Potato', 'Carrot', 'Beef', 'Pork',
  'Mushroom', 'Spinach', 'Broccoli', 'Bell pepper', 'Chili', 'Ginger',
  'Soy sauce', 'Honey', 'Garlic powder', 'Onion powder', 'Paprika',
  'Cinnamon', 'Cumin', 'Coriander', 'Turmeric', 'Basil', 'Oregano',
  'Thyme', 'Rosemary', 'Bay leaf', 'Nutmeg', 'Vanilla', 'Cocoa',
  'Chocolate', 'Cream', 'Yogurt', 'Coconut milk', 'Lime', 'Apple',
  'Banana', 'Strawberry', 'Blueberry', 'Avocado', 'Cucumber',
  'Lettuce', 'Cabbage', 'Celery', 'Zucchini', 'Eggplant',
  'Sweet potato', 'Corn', 'Peas', 'Green bean', 'Cauliflower',
]

interface IngredientSuggestionsProps {
  suggestions: string[]
  selectedIngredients: string[]
  isLoading: boolean
  onSelect: (name: string) => void
  highlightedIndex: number
  inputValue: string
  isFocused: boolean
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>
  const index = text.toLowerCase().indexOf(highlight.toLowerCase())
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <strong className="text-foreground">{text.slice(index, index + highlight.length)}</strong>
      {text.slice(index + highlight.length)}
    </>
  )
}

export function IngredientSuggestions({
  suggestions,
  selectedIngredients,
  isLoading,
  onSelect,
  highlightedIndex,
  inputValue,
  isFocused,
}: IngredientSuggestionsProps) {
  const showCommon = !inputValue || inputValue.length < 2

  const commonToShow = useMemo(() => {
    if (!showCommon) return []
    const trimmed = inputValue.trim().toLowerCase()
    if (!trimmed) return COMMON_INGREDIENTS
    return COMMON_INGREDIENTS.filter((item) =>
      item.toLowerCase().includes(trimmed)
    )
  }, [showCommon, inputValue])

  const hasResults = showCommon ? commonToShow.length > 0 : suggestions.length > 0
  if (!isFocused) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-amber-500/20 bg-card shadow-2xl shadow-black/40"
      >
        {isLoading ? (
          <div className="p-3 text-sm text-muted-foreground">
            Loading ingredients...
          </div>
        ) : !hasResults ? (
          <div className="p-3 text-sm text-muted-foreground">
            No matching ingredients
          </div>
        ) : (
          <ul className="py-1" role="listbox">
            {showCommon
              ? commonToShow.map((name) => {
                  const isSelected = selectedIngredients.includes(name)
                  return (
                    <li
                      key={name}
                      role="option"
                      aria-selected={false}
                      onClick={() => onSelect(name)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors',
                        isSelected
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded border border-amber-500/30">
                        {isSelected && <Check size={10} className="text-amber-400" />}
                      </span>
                      <span className="truncate">{name}</span>
                    </li>
                  )
                })
              : suggestions.map((name, index) => {
                  const isSelected = selectedIngredients.includes(name)
                  return (
                    <li
                      key={name}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        onSelect(name)
                      }}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors',
                        index === highlightedIndex
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded border border-amber-500/30">
                        {isSelected && <Check size={10} className="text-amber-400" />}
                      </span>
                      <span className="truncate">
                        <HighlightedText text={name} highlight={inputValue} />
                      </span>
                    </li>
                  )
                })}
          </ul>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
