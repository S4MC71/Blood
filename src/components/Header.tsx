'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Heart, User, LogOut, Menu, X, Search, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeaderProps {
  userEmail?: string | null
}

export default function Header({ userEmail: initialEmail }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string | null | undefined>(initialEmail)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setEmail(session?.user?.email ?? null)
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        router.refresh()
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-100/60 bg-white/90 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-sm transition-transform group-hover:scale-105">
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Roktodan<span className="text-red-500">.online</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {email ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-all"
              >
                <Search className="h-3.5 w-3.5 text-red-500" />
                Find Donor
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-all"
              >
                <User className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-all cursor-pointer disabled:opacity-60"
              >
                {loggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-rose-600 active:scale-95 transition-all"
              >
                <Heart className="h-3.5 w-3.5 fill-white/30" />
                Register as Donor
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile right side */}
        <div className="flex items-center gap-2 md:hidden">
          {!email ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-all shadow-sm shadow-red-500/20"
              >
                Join
              </Link>
            </div>
          ) : (
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open Menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <nav className="mx-auto max-w-6xl flex flex-col px-4 py-3 gap-1">
            {email ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <Search className="h-4 w-4 text-red-500" />
                  Find Donor
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <User className="h-4 w-4" />
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer text-left w-full disabled:opacity-60"
                >
                  {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  Register as Donor
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
