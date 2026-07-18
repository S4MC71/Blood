'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Heart, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

const inputClass =
  'block w-full h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl p-6 sm:p-8">

            {sent ? (
              /* ── Success State ── */
              <div className="flex flex-col items-center text-center py-4 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Check your email</h1>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    We sent a password reset link to{' '}
                    <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>.
                    Click the link in the email to set a new password.
                  </p>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Didn&apos;t receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => { setSent(false); setEmail('') }}
                    className="text-red-600 dark:text-red-400 font-semibold hover:underline cursor-pointer"
                  >
                    try again
                  </button>.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Forgot Password?</h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed transition-all mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Reset Link…
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
