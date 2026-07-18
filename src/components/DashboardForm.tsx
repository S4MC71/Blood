'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { bangladeshData, bloodGroups } from '@/utils/bangladeshData'
import { getCooldownStatus } from '@/utils/donationUtils'
import ConfirmationModal from '@/components/ConfirmationModal'
import DonationHistorySection, { DonationRecord } from '@/components/DonationHistorySection'
import {
  Save,
  User,
  Phone,
  Calendar,
  Loader2,
  ChevronDown,
  CheckCircle,
  Award,
  AlertTriangle,
  Heart,
  ShieldAlert,
  Settings,
  Activity,
} from 'lucide-react'

export interface Profile {
  id: string
  full_name: string
  blood_group: string
  phone: string
  division: string
  district: string
  upazila: string
  last_donation_date: string | null
  is_available: boolean
  initial_donation_count: number
  gender: string
}

interface DashboardFormProps {
  initialProfile: Profile
  initialHistory: DonationRecord[]
}

const inputClass =
  'block w-full h-11 rounded-xl border border-zinc-200 bg-white/80 px-3.5 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

const selectClass =
  'block w-full h-11 appearance-none rounded-xl border border-zinc-200 bg-white/80 px-3.5 text-sm font-medium text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-900/30 disabled:opacity-40 transition-all cursor-pointer'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
      {children}
    </label>
  )
}

function SelectField({
  value,
  onChange,
  disabled = false,
  children,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={selectClass}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  )
}

function AlertBanner({
  type,
  children,
}: {
  type: 'error' | 'success' | 'warning'
  children: React.ReactNode
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400',
    warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400',
  }
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium ${styles[type]}`}>
      {type === 'success' && <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />}
      {type === 'warning' && <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />}
      {type === 'error' && <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
      <div>{children}</div>
    </div>
  )
}

export default function DashboardForm({ initialProfile, initialHistory }: DashboardFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'tracker' | 'profile'>('tracker')

  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [bloodGroup, setBloodGroup] = useState(initialProfile.blood_group || '')
  const [gender, setGender] = useState(initialProfile.gender || 'male')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [division, setDivision] = useState(initialProfile.division || '')
  const [district, setDistrict] = useState(initialProfile.district || '')
  const [upazila, setUpazila] = useState(initialProfile.upazila || '')
  const [lastDonationDate, setLastDonationDate] = useState(initialProfile.last_donation_date || '')
  const [isAvailable, setIsAvailable] = useState(initialProfile.is_available)
  const [togglingAvailability, setTogglingAvailability] = useState(false)

  const [initialDonationCount, setInitialDonationCount] = useState(initialProfile.initial_donation_count || 0)
  const [pendingBaselineInput, setPendingBaselineInput] = useState((initialProfile.initial_donation_count || 0).toString())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [history, setHistory] = useState<DonationRecord[]>(initialHistory)
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const divisions = Object.keys(bangladeshData)
  const districts = division ? Object.keys(bangladeshData[division] || {}) : []
  const upazilas = division && district ? bangladeshData[division][district] || [] : []

  const cooldownStatus = getCooldownStatus(lastDonationDate, gender)
  const totalUserDonations = initialDonationCount + history.length
  const effectiveIsAvailable = cooldownStatus.isEligible ? isAvailable : false

  useEffect(() => {
    if (!cooldownStatus.isEligible && isAvailable) setIsAvailable(false)
  }, [cooldownStatus.isEligible, isAvailable])

  // Auto-clear success messages
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  const handleDivisionChange = (val: string) => { setDivision(val); setDistrict(''); setUpazila('') }
  const handleDistrictChange = (val: string) => { setDistrict(val); setUpazila('') }

  const handleHistoryChange = (updatedHistory: DonationRecord[]) => {
    setHistory(updatedHistory)
    if (updatedHistory.length > 0) {
      const latest = updatedHistory[0].donation_date
      setLastDonationDate(latest)
      const status = getCooldownStatus(latest, gender)
      if (!status.isEligible) setIsAvailable(false)
    }
  }

  const handleToggleAvailability = async () => {
    setErrorMsg('')
    setSuccessMsg('')

    if (!cooldownStatus.isEligible) return // blocked silently, banner already shows

    const nextVal = !isAvailable
    setTogglingAvailability(true)
    setIsAvailable(nextVal)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: nextVal, updated_at: new Date().toISOString() })
        .eq('id', initialProfile.id)

      if (error) throw error
      setSuccessMsg(nextVal ? 'You are now set as AVAILABLE for donation.' : 'You are now set as UNAVAILABLE.')
      router.refresh()
    } catch {
      setIsAvailable(!nextVal)
      setErrorMsg('Failed to update donation status. Please try again.')
    } finally {
      setTogglingAvailability(false)
    }
  }

  const handleOpenBaselineModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const handleConfirmBaseline = async () => {
    const parsed = parseInt(pendingBaselineInput, 10)
    const validCount = isNaN(parsed) || parsed < 0 ? 0 : parsed
    setInitialDonationCount(validCount)
    setPendingBaselineInput(validCount.toString())
    setIsModalOpen(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ initial_donation_count: validCount, updated_at: new Date().toISOString() })
        .eq('id', initialProfile.id)

      if (error) throw error
      setSuccessMsg(`Baseline set to ${validCount} donation${validCount !== 1 ? 's' : ''}!`)
      router.refresh()
    } catch {
      setErrorMsg('Failed to save baseline count.')
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaveSuccess(false)
    setErrorMsg('')
    setSuccessMsg('')

    const finalAvailability = cooldownStatus.isEligible ? isAvailable : false

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          blood_group: bloodGroup,
          gender,
          phone,
          division,
          district,
          upazila,
          last_donation_date: lastDonationDate || null,
          is_available: finalAvailability,
          initial_donation_count: initialDonationCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialProfile.id)

      if (error) throw error
      setSaveSuccess(true)
      setSuccessMsg('Profile updated successfully!')
      router.refresh()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setErrorMsg('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Total Donations Banner ── */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 p-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 border border-white/20">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-100">
                Your Total Donations
              </div>
              <div className="text-2xl font-extrabold leading-tight">
                {totalUserDonations}
                <span className="text-sm font-semibold text-red-100 ml-1">
                  {totalUserDonations === 1 ? 'time' : 'times'}
                </span>
              </div>
              <div className="text-[11px] text-red-100/80 mt-0.5">
                {initialDonationCount} offline baseline + {history.length} platform logs
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 px-3.5 py-2.5 self-start sm:self-auto sm:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-100">Medical Status</div>
            <div className="mt-0.5 text-xs font-bold">
              {cooldownStatus.isEligible ? (
                <span className="text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Eligible to donate
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {cooldownStatus.daysRemaining}d cooldown left
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
        {(['tracker', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {tab === 'tracker' ? (
              <><Activity className="h-3.5 w-3.5 text-red-500 shrink-0" /> Status &amp; History</>
            ) : (
              <><Settings className="h-3.5 w-3.5 shrink-0" /> Profile &amp; Location</>
            )}
          </button>
        ))}
      </div>

      {/* ── Global Alerts ── */}
      {errorMsg && <AlertBanner type="error">{errorMsg}</AlertBanner>}
      {successMsg && <AlertBanner type="success">{successMsg}</AlertBanner>}

      {/* ══════════════════════════════ TAB 1: Status & History ══════════════════════════════ */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {/* Medical cooldown banner */}
          {!cooldownStatus.isEligible && (
            <AlertBanner type="warning">
              <strong>Medical Restriction Active.</strong> Your last donation was on{' '}
              <strong>{lastDonationDate}</strong>. {cooldownStatus.daysRemaining} days remain before
              you are eligible again (on <strong>{cooldownStatus.nextEligibleDateStr}</strong>).
              For your health, your availability is locked off until then.
            </AlertBanner>
          )}

          {/* Availability Toggle Card */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-900/70 backdrop-blur-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  Donation Status
                  {togglingAvailability && <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {!cooldownStatus.isEligible
                    ? `Locked — medical cooldown (${cooldownStatus.daysRemaining} days remaining)`
                    : effectiveIsAvailable
                    ? 'You are visible to people searching for donors'
                    : 'You are hidden from donor searches'}
                </p>
              </div>
              <button
                type="button"
                disabled={togglingAvailability || !cooldownStatus.isEligible}
                onClick={handleToggleAvailability}
                role="switch"
                aria-checked={effectiveIsAvailable}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                  effectiveIsAvailable ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    effectiveIsAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Baseline Past Donations */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-900/70 backdrop-blur-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Offline Baseline Count</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Donations before joining this platform (not counted in site total)
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <input
                type="number"
                min="0"
                max="200"
                value={pendingBaselineInput}
                onChange={(e) => setPendingBaselineInput(e.target.value)}
                placeholder="e.g. 18"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={handleOpenBaselineModal}
                className="h-11 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition-all cursor-pointer shrink-0"
              >
                Set Count
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Current: <strong className="text-zinc-600 dark:text-zinc-300">{initialDonationCount} times</strong>
            </p>
          </div>

          {/* Donation History Log */}
          <DonationHistorySection
            userId={initialProfile.id}
            gender={gender}
            initialHistory={history}
            onHistoryChange={handleHistoryChange}
          />
        </div>
      )}

      {/* ══════════════════════════════ TAB 2: Profile & Location ══════════════════════════════ */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Personal Info card */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-900/70 backdrop-blur-xl p-4 shadow-sm space-y-3.5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Personal Information
            </h3>

            <div>
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Blood Group</Label>
                <SelectField value={bloodGroup} onChange={setBloodGroup}>
                  {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                </SelectField>
              </div>
              <div>
                <Label>Gender</Label>
                <SelectField value={gender} onChange={setGender}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </SelectField>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Mobile</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <Label>Last Donation Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="date"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location card */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-900/70 backdrop-blur-xl p-4 shadow-sm space-y-3.5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Location
            </h3>

            <div>
              <Label>Division</Label>
              <SelectField value={division} onChange={handleDivisionChange}>
                <option value="">Select Division</option>
                {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
              </SelectField>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>District</Label>
                <SelectField value={district} onChange={handleDistrictChange} disabled={!division}>
                  <option value="">Select</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </SelectField>
              </div>
              <div>
                <Label>Upazila</Label>
                <SelectField value={upazila} onChange={setUpazila} disabled={!district}>
                  <option value="">Select</option>
                  {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                </SelectField>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed ${
              saveSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 hover:shadow-lg disabled:opacity-80'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile &amp; Location
              </>
            )}
          </button>
        </form>
      )}

      {/* Confirmation Modal for baseline */}
      <ConfirmationModal
        isOpen={isModalOpen}
        count={parseInt(pendingBaselineInput, 10) || 0}
        onConfirm={handleConfirmBaseline}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  )
}
