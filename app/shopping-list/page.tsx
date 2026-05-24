'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Trash2, CheckCheck, X } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useAuth } from '@/lib/AuthProvider'
import { auth } from '@/lib/firebase'

export default function ShoppingListPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { items, uncheckedItems, checkedItems, addItem, removeItem, toggleItem, clearChecked } = useShoppingList()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.replace('/auth')
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  const handleAdd = () => {
    if (!name.trim()) return
    addItem({ name: name.trim(), quantity: quantity.trim() || '1', category: 'other' })
    setName('')
    setQuantity('')
    setShowForm(false)
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-4xl">Shopping List</h1>
          <p className="mt-1 text-sm text-muted-foreground">{uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''} to buy</p>
        </div>
        <div className="flex gap-2">
          {checkedItems.length > 0 && (
            <button onClick={clearChecked} className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground active:scale-[0.96]">
              <CheckCheck size={14} />
              Clear done
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-amber-400 active:scale-[0.96]">
            <Plus size={16} />
            Add
          </button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 rounded-2xl border border-amber-500/20 bg-card p-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="flex-1 rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none sm:py-2.5"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-2">
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Qty"
                className="flex-1 rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:outline-none sm:w-24 sm:py-2.5"
              />
              <button onClick={handleAdd} className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 active:scale-[0.96] sm:px-4 sm:py-2.5">Add</button>
            </div>
          </div>
        </motion.div>
      )}

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 bg-card/50 py-20 text-center">
          <ShoppingCart size={48} className="mb-4 text-amber-500/30" />
          <p className="font-heading text-lg font-bold text-foreground">Shopping list is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Add items you need to buy</p>
        </motion.div>
      ) : (
        <div className="space-y-1">
          {uncheckedItems.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <button onClick={() => toggleItem(item.id)} className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-foreground/5 transition-all hover:ring-amber-500/20 active:scale-[0.99]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-foreground/20" />
                <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
                {item.quantity && <span className="text-xs text-muted-foreground">{item.quantity}</span>}
                <span onClick={(e) => { e.stopPropagation(); removeItem(item.id) }} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-400">
                  <Trash2 size={12} />
                </span>
              </button>
            </motion.div>
          ))}
          {checkedItems.length > 0 && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-foreground/10" />
                <span className="text-xs text-muted-foreground">{checkedItems.length} checked</span>
                <div className="h-px flex-1 bg-foreground/10" />
              </div>
              {checkedItems.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0 }}>
                  <button onClick={() => toggleItem(item.id)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left opacity-50 transition-all hover:opacity-80">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/20">
                      <X size={10} className="text-emerald-400" />
                    </span>
                    <span className="flex-1 text-sm text-muted-foreground line-through">{item.name}</span>
                    {item.quantity && <span className="text-xs text-muted-foreground">{item.quantity}</span>}
                  </button>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
    </>
  )
}
