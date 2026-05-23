'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IceCream, Mail, Lock, User, Eye, EyeOff, Sparkles, ChefHat } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp, user, isLoading } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)


  useEffect(() => {
    if (user) router.push('/')
  }, [user, router])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Fill in all fields'); return }
    if (mode === 'signup' && !name) { setError('Fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
      }
      router.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      if (msg.includes('auth/user-not-found')) setError('No account with this email')
      else if (msg.includes('auth/wrong-password')) setError('Wrong password')
      else if (msg.includes('auth/email-already-in-use')) setError('Email already in use')
      else if (msg.includes('auth/invalid-credential')) setError('Invalid email or password')
      else if (msg.includes('auth/weak-password')) setError('Password too weak')
      else setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [email, password, name, mode, signIn, signUp, router])

  if (isLoading || user) return null

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 4) * 2,
              height: 2 + (i % 4) * 2,
              background: i % 3 === 0
                ? 'oklch(0.72 0.16 65 / 0.3)'
                : i % 3 === 1
                  ? 'oklch(0.92 0.01 60 / 0.2)'
                  : 'oklch(0.78 0.12 75 / 0.2)',
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 13 + 20) % 100}%`,
            }}
            animate={{
              y: [0, -30 - (i % 5) * 10, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Gradient glow orbs */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
      </div>
      <div className="absolute right-1/4 top-2/3 pointer-events-none">
        <div className="h-60 w-60 rounded-full bg-amber-500/3 blur-3xl" />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/20">
            <IceCream size={32} className="text-amber-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Join Fridge Raid'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login' ? 'Sign in to save your favorites' : 'Create your account'}
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          layout
          className="rounded-2xl border border-amber-500/10 bg-card p-6 shadow-2xl shadow-amber-500/5"
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-amber-500/10 bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-amber-500/10 bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-amber-500/10 bg-background py-2.5 pl-9 pr-10 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full overflow-hidden rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      <ChefHat size={16} />
                    </motion.span>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={16} />
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </button>
            </motion.form>
          </AnimatePresence>



          {/* Toggle mode */}
          <div className="mt-5 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-xs text-muted-foreground transition-colors hover:text-amber-400"
            >
              {mode === 'login' ? (
                <>Don&apos;t have an account? <span className="font-medium underline underline-offset-2">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-medium underline underline-offset-2">Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
