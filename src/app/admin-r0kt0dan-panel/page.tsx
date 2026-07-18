'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getCooldownStatus } from '@/utils/donationUtils'
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  User,
  Phone,
  MapPin,
  Droplets,
  Calendar,
} from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  blood_group: string
  phone: string
  division: string
  district: string
  upazila: string
  gender: string
  is_available: boolean
  last_donation_date: string | null
  initial_donation_count: number
  created_at: string
}

interface DeleteConfirm {
  profile: Profile
}

export default function AdminPanelPage() {
  const supabase = createClient()

  // Auth gate
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Data
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Deletion
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Search
  const [search, setSearch] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    // Only server-side verification — password never exposed in client JS bundle
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': password,
        },
      })
      if (res.ok) {
        setAuthenticated(true)
        loadProfiles()
      } else {
        setAuthError('Incorrect admin password. Access denied.')
      }
    } catch {
      setAuthError('Could not reach server. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const loadProfiles = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err: any) {
      setErrorMsg('Failed to load profiles: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return
    const profile = deleteConfirm.profile
    setDeleteConfirm(null)
    setDeletingId(profile.id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': password,
        },
        body: JSON.stringify({ userId: profile.id }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Delete failed')
      }

      setProfiles((prev) => prev.filter((p) => p.id !== profile.id))
      setSuccessMsg(`"${profile.full_name}" has been permanently deleted.`)

      // Clear success after 5s
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      setErrorMsg('Delete failed: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase()
    return (
      !q ||
      p.full_name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.blood_group?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.division?.toLowerCase().includes(q)
    )
  })

  // ── Login Gate ──
  if (!authenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/50 border border-red-900/40 mb-4">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
            <p className="text-sm text-zinc-400 mt-1">Restricted access — admin only</p>
          </div>

          {authError && (
            <div className="mb-4 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="block w-full h-12 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 pl-10 pr-12 text-sm font-medium text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-900/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-600 text-sm font-bold text-white transition-all disabled:opacity-70 cursor-pointer active:scale-[0.98]"
            >
              {authLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
              ) : (
                <><Shield className="h-4 w-4" /> Access Admin Panel</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 mt-6">
            This page is not linked anywhere on the site.
          </p>
        </div>
      </div>
    )
  }

  // ── Admin Dashboard ──
  return (
    <div className="flex-1 bg-zinc-950 min-h-screen">
      {/* Top bar */}
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950/60 border border-red-900/40">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white">Admin Panel</h1>
              <p className="text-[11px] text-zinc-500">
                {profiles.length} registered users
              </p>
            </div>
          </div>
          <button
            onClick={loadProfiles}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Alerts */}
        {errorMsg && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="ml-auto shrink-0 text-red-500 hover:text-red-300 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-400 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="ml-auto shrink-0 text-emerald-500 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Users className="h-4 w-4 text-blue-400" />, value: profiles.length, label: 'Total Users' },
            { icon: <CheckCircle className="h-4 w-4 text-emerald-400" />, value: profiles.filter(p => p.is_available).length, label: 'Available' },
            { icon: <Droplets className="h-4 w-4 text-red-400" />, value: profiles.filter(p => !p.is_available).length, label: 'Unavailable' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-xl font-extrabold text-white">{s.value}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, blood group, location…"
            className="block w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800 px-4 pl-10 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-900/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-500 gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading users…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <Users className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">{search ? 'No users match your search.' : 'No users registered yet.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 pb-1">
              Showing {filtered.length} of {profiles.length} users
              {search && ` — filtered by "${search}"`}
            </p>
            {filtered.map((profile) => {
              const cooldown = getCooldownStatus(profile.last_donation_date, profile.gender)
              const isDeleting = deletingId === profile.id
              const joinedDate = new Date(profile.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })

              return (
                <div
                  key={profile.id}
                  className={`rounded-xl border border-zinc-800 bg-zinc-900 p-3.5 transition-all ${isDeleting ? 'opacity-50 scale-[0.99]' : 'hover:border-zinc-700'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Blood group badge */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/50 border border-red-900/30">
                      <span className="text-xs font-extrabold text-red-400">{profile.blood_group || '—'}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{profile.full_name || 'No name'}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <Phone className="h-3 w-3" /> {profile.phone || '—'}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <MapPin className="h-3 w-3" /> {[profile.upazila, profile.district, profile.division].filter(Boolean).join(', ') || '—'}
                            </span>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => setDeleteConfirm({ profile })}
                          disabled={isDeleting}
                          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/30 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/60 hover:border-red-700 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>

                      {/* Meta badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          profile.is_available && cooldown.isEligible
                            ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}>
                          {profile.is_available && cooldown.isEligible ? '● Available' : '● Unavailable'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                          {profile.gender === 'female' ? '♀ Female' : '♂ Male'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                          <Calendar className="h-2.5 w-2.5" /> Joined {joinedDate}
                        </span>
                        {profile.last_donation_date && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                            Last donation: {profile.last_donation_date}
                          </span>
                        )}
                      </div>

                      {/* User ID (for reference) */}
                      <p className="text-[10px] text-zinc-600 mt-1.5 font-mono truncate">
                        ID: {profile.id}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 border border-red-900/40">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Permanently Delete?</h3>
                  <p className="text-xs text-zinc-400">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-3.5 space-y-1">
              <p className="text-sm font-bold text-white">{deleteConfirm.profile.full_name}</p>
              <p className="text-xs text-zinc-400">{deleteConfirm.profile.phone}</p>
              <p className="text-xs text-zinc-400">
                {deleteConfirm.profile.blood_group} · {deleteConfirm.profile.district}, {deleteConfirm.profile.division}
              </p>
              <p className="text-[11px] font-mono text-zinc-600 truncate">{deleteConfirm.profile.id}</p>
            </div>

            <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 px-3.5 py-2.5 text-xs text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              This will permanently delete the user&apos;s account, profile, and all donation history records.
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 h-11 rounded-xl bg-red-700 hover:bg-red-600 text-sm font-bold text-white transition-all cursor-pointer active:scale-[0.98]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
