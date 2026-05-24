'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useIngredients } from '@/hooks/useIngredients'
import { useIngredientList } from '@/hooks/useIngredientList'
import { IngredientTag } from '@/components/IngredientTag'
import { IngredientSuggestions } from '@/components/IngredientSuggestions'
import { Search, X } from 'lucide-react'

const COLORS = [
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'bg-lime-500/20 text-lime-300 border-lime-500/30',
  'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
]

export function IngredientInput() {
  const { ingredients, toggleIngredient, removeIngredient } = useIngredients()
  const { ingredientList, isLoading } = useIngredientList()
  const [inputValue, setInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return []
    const trimmed = inputValue.trim().toLowerCase()
    return ingredientList
      .filter((item) =>
        item.strIngredient.toLowerCase().includes(trimmed)
      )
      .map((item) => item.strIngredient)
      .slice(0, 8)
  }, [inputValue, ingredientList])

  const handleSelect = useCallback(
    (name: string) => {
      toggleIngredient(name)
      setInputValue('')
      setHighlightedIndex(0)
      inputRef.current?.focus()
    },
    [toggleIngredient]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const trimmed = inputValue.trim()
        if (trimmed && filteredSuggestions.length > 0 && highlightedIndex >= 0) {
          handleSelect(filteredSuggestions[highlightedIndex])
        } else if (trimmed) {
          toggleIngredient(trimmed)
          setInputValue('')
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      } else if (e.key === 'Backspace' && !inputValue && ingredients.length > 0) {
        removeIngredient(ingredients[ingredients.length - 1])
      }
    },
    [inputValue, filteredSuggestions, highlightedIndex, handleSelect, toggleIngredient, removeIngredient, ingredients]
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(0)
  }, [])

  const handleFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 200)
  }, [])

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-card p-3 ring-1 ring-amber-500/10 transition-all focus-within:border-amber-500/40 focus-within:ring-2 focus-within:ring-amber-500/30">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <AnimatePresence mode="popLayout">
          {ingredients.map((name, i) => (
            <IngredientTag
              key={name}
              name={name}
              color={COLORS[i % COLORS.length]}
              onRemove={() => removeIngredient(name)}
            />
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={ingredients.length === 0 ? "Pretraži sastojke... (npr. piletina, beli luk)" : "Dodaj još..."}
          className="min-w-[120px] flex-1 bg-transparent py-1.5 text-base text-foreground placeholder-muted-foreground outline-none"
          inputMode="search"
          autoComplete="off"
        />
        {ingredients.length > 0 && (
          <button
            onClick={() => {
              ingredients.forEach((name) => removeIngredient(name))
            }}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Obriši sve sastojke"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <IngredientSuggestions
        suggestions={filteredSuggestions}
        selectedIngredients={ingredients}
        isLoading={isLoading}
        onSelect={handleSelect}
        highlightedIndex={highlightedIndex}
        inputValue={inputValue}
        isFocused={isOpen}
      />
      {ingredients.length > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {ingredients.length} {ingredients.length !== 1 ? 'sastojaka izabrano' : 'sastojak izabran'}
        </p>
      )}
    </div>
  )
}
