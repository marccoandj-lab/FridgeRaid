'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IceCream, Mail, Lock, User, Eye, EyeOff, Sparkles, ChefHat } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle, user } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    if (user) router.push('/')
  }, [user, router])

  if (user) return null

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

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-500/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Google sign in */}
          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={async () => {
              setError('')
              setIsGoogleLoading(true)
              try {
                await signInWithGoogle()
                router.push('/')
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : ''
                if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
                  setError('Google sign-in failed. Try again or use email.')
                }
              } finally {
                setIsGoogleLoading(false)
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-amber-500/10 bg-background py-2.5 text-sm font-medium text-foreground transition-all hover:bg-amber-500/5 hover:border-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width={18} height={18} xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

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
