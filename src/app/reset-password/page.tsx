'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Heart, Lock, Loader2, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

const inputClass =
  'block w-full h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = !password
    ? 0
    : password.length < 6
    ? 1
    : password.length < 10
    ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password)
    ? 4
    : 3

  const labels = ['', 'Too short', 'Weak', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-zinc-200 dark:bg-zinc-700'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase sends the session via URL hash — listen for it
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Also check if there's already a session (page reload case)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
  }, [supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setSuccess(true)
      // Sign out after reset so they log in fresh
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl p-6 sm:p-8">
      {success ? (
        /* ── Success ── */
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Password Changed!</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Your password has been updated successfully. Redirecting you to login…
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Going to login…
          </div>
        </div>
      ) : !sessionReady ? (
        /* ── Waiting for session from email link ── */
        <div className="flex flex-col items-center text-center py-6 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Invalid or Expired Link</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 text-sm font-bold text-white shadow-md hover:from-red-700 transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      ) : (
        /* ── Reset Form ── */
        <>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Set New Password</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Choose a strong password for your account.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={`${inputClass} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={password} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  className={`${inputClass} pl-10 pr-12 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-400 focus:border-red-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-400 focus:border-emerald-500'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors p-0.5"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!confirmPassword && password !== confirmPassword)}
              className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password…
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Logo pill */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 px-4 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-sm font-bold text-red-700 dark:text-red-400">Roktodan.online</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm">
          <Suspense fallback={
            <div className="rounded-3xl border border-zinc-200/60 bg-white/70 dark:bg-zinc-900/70 p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
