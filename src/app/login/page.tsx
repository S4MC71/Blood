'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Heart, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'

const inputClass =
  'block w-full h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:text-white dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 600)
    } catch {
      setErrorMsg('Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Logo pill */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <div className="flex items-center gap-2 rounded-full border border-red-200 bg-white/50 dark:border-zinc-800/60 dark:bg-zinc-900/50 px-4 py-2 shadow-sm backdrop-blur-md">
          <div className="relative h-8 w-8 flex items-center justify-center">
            <Image src="/logo.png" alt="Roktodan Logo" fill className="object-contain drop-shadow-sm scale-125" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white">Roktodan<span className="text-red-500">.online</span></span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Sign in to your donor account</p>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Login successful! Redirecting…
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputClass} pl-10 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed transition-all mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Redirecting…
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Join as a donor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
