'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, AlertTriangle, Timer, Refrigerator, X } from 'lucide-react'
import { usePantry, type PantryItem } from '@/hooks/usePantry'
import { useAuth } from '@/lib/AuthProvider'
import { auth } from '@/lib/firebase'

export default function PantryPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { items, addItem, removeItem, updateItem, categories } = usePantry()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('other')
  const [expiryDate, setExpiryDate] = useState('')

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.replace('/auth')
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  const grouped = new Map<string, PantryItem[]>()
  for (const item of items) {
    const cat = item.category || 'other'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }

  const now = Date.now()
  const threeDays = 3 * 24 * 60 * 60 * 1000

  const handleAdd = () => {
    if (!name.trim()) return
    addItem({
      name: name.trim(),
      quantity: quantity.trim() || '1',
      category,
      expiryDate: expiryDate || null,
    })
    setName('')
    setQuantity('')
    setExpiryDate('')
    setShowForm(false)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-4 sm:pb-16 sm:pt-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-4xl">Pantry</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} stored</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-amber-400 active:scale-[0.96]"
        >
          <Plus size={16} />
          Add item
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden sm:mb-8"
          >
            <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-card p-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingredient name"
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none sm:py-2.5"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Qty (e.g. 2, 500ml)"
                  className="flex-1 rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none sm:py-2.5"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-foreground/10 bg-background px-3 py-3 text-sm text-foreground focus:border-amber-500/40 focus:outline-none sm:py-2.5"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="flex-1 rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground focus:border-amber-500/40 focus:outline-none sm:py-2.5"
                />
                <button onClick={handleAdd} className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 active:scale-[0.96] sm:px-6 sm:py-2.5">
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 bg-card/50 py-20 text-center">
          <Refrigerator size={48} className="mb-4 text-amber-500/30" />
          <p className="font-heading text-lg font-bold text-foreground">Your pantry is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Add ingredients you have at home</p>
        </motion.div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {Array.from(grouped.entries()).map(([cat, catItems]) => (
            <section key={cat}>
              <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">{cat}</h2>
              <div className="space-y-2">
                {catItems.map((item, i) => {
                  const isExpiring = item.expiryDate && new Date(item.expiryDate).getTime() - now <= threeDays && new Date(item.expiryDate).getTime() > now
                  const isExpired = item.expiryDate && new Date(item.expiryDate).getTime() < now
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                        isExpired ? 'bg-red-500/10 ring-1 ring-red-500/20' : isExpiring ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-card ring-1 ring-foreground/5'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.expiryDate && (
                          <span className={`flex items-center gap-1 text-[10px] ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-muted-foreground'}`}>
                            {isExpired || isExpiring ? <AlertTriangle size={10} /> : <Timer size={10} />}
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                        <button onClick={() => removeItem(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
