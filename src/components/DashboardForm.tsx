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
  'block w-full h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:text-white dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

const selectClass =
  'block w-full h-12 appearance-none rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:text-white dark:focus:ring-red-900/30 disabled:opacity-40 transition-all cursor-pointer'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  )
}

export default function DashboardForm({
  initialProfile,
  initialHistory,
}: DashboardFormProps) {
  const router = useRouter()
  const supabase = createClient()

  // Tab State: 'tracker' (Status & History) vs 'profile' (Personal & Location Settings)
  const [activeTab, setActiveTab] = useState<'tracker' | 'profile'>('tracker')

  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [bloodGroup, setBloodGroup] = useState(initialProfile.blood_group || '')
  const [gender, setGender] = useState(initialProfile.gender || 'male')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [division, setDivision] = useState(initialProfile.division || '')
  const [district, setDistrict] = useState(initialProfile.district || '')
  const [upazila, setUpazila] = useState(initialProfile.upazila || '')
  const [lastDonationDate, setLastDonationDate] = useState(
    initialProfile.last_donation_date || ''
  )
  const [isAvailable, setIsAvailable] = useState(initialProfile.is_available)
  const [togglingAvailability, setTogglingAvailability] = useState(false)

  // Baseline donation count states
  const [initialDonationCount, setInitialDonationCount] = useState<number>(
    initialProfile.initial_donation_count || 0
  )
  const [pendingBaselineInput, setPendingBaselineInput] = useState<string>(
    (initialProfile.initial_donation_count || 0).toString()
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  // History state
  const [history, setHistory] = useState<DonationRecord[]>(initialHistory)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [cooldownAlertMsg, setCooldownAlertMsg] = useState('')

  const divisions = Object.keys(bangladeshData)
  const districts = division ? Object.keys(bangladeshData[division] || {}) : []
  const upazilas = division && district ? bangladeshData[division][district] || [] : []

  // Dynamic calculations for medical cooldown
  const cooldownStatus = getCooldownStatus(lastDonationDate, gender)
  const totalUserDonations = initialDonationCount + history.length

  // Effective availability status: MUST be false if in cooldown
  const effectiveIsAvailable = cooldownStatus.isEligible ? isAvailable : false

  // Sync isAvailable state if in cooldown
  useEffect(() => {
    if (!cooldownStatus.isEligible && isAvailable) {
      setIsAvailable(false)
    }
  }, [cooldownStatus.isEligible, isAvailable])

  const handleDivisionChange = (val: string) => {
    setDivision(val)
    setDistrict('')
    setUpazila('')
  }
  const handleDistrictChange = (val: string) => {
    setDistrict(val)
    setUpazila('')
  }

  // Handle history changes from DonationHistorySection
  const handleHistoryChange = (updatedHistory: DonationRecord[]) => {
    setHistory(updatedHistory)
    if (updatedHistory.length > 0) {
      const latest = updatedHistory[0].donation_date
      setLastDonationDate(latest)

      // Recalculate cooldown for latest date
      const status = getCooldownStatus(latest, gender)
      if (!status.isEligible) {
        setIsAvailable(false)
      }
    }
  }

  // INSTANT Availability Toggle Switch Handler (Updates Supabase immediately)
  const handleToggleAvailability = async () => {
    setCooldownAlertMsg('')
    setSuccessMsg('')
    setErrorMsg('')

    if (!cooldownStatus.isEligible) {
      setCooldownAlertMsg(
        `Medical Restriction: You donated blood on ${lastDonationDate}. For your physical health, you must complete the ${cooldownStatus.requiredDays}-day cooldown (${cooldownStatus.daysRemaining} days remaining, eligible on ${cooldownStatus.nextEligibleDateStr}).`
      )
      return
    }

    const nextVal = !isAvailable
    setTogglingAvailability(true)
    setIsAvailable(nextVal)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_available: nextVal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialProfile.id)

      if (error) throw error

      setSuccessMsg(
        nextVal
          ? 'Your donation status is now set to AVAILABLE!'
          : 'Your donation status is now set to UNAVAILABLE.'
      )
      router.refresh()
    } catch (err: any) {
      setIsAvailable(!nextVal) // Rollback on error
      setErrorMsg('Failed to update status in Supabase. Please try again.')
    } finally {
      setTogglingAvailability(false)
    }
  }

  // Save baseline donation count modal trigger
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

    // Save baseline count directly to Supabase immediately
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          initial_donation_count: validCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialProfile.id)

      if (error) throw error
      setSuccessMsg('Baseline donation count saved to Supabase!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg('Failed to save baseline count in Supabase.')
    }
  }

  // Save Personal & Location Info Tab Form Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    setCooldownAlertMsg('')

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

      setSuccessMsg('Personal and location information updated successfully!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Total Donation Badge & Summary Banner */}
      <div className="rounded-3xl border border-red-200/60 bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-100">
                Your Total Blood Donations
              </span>
              <div className="text-3xl font-extrabold leading-none mt-0.5">
                {totalUserDonations}{' '}
                <span className="text-sm font-semibold text-red-100">
                  {totalUserDonations === 1 ? 'Time' : 'Times'}
                </span>
              </div>
              <p className="text-xs text-red-100/90 mt-1">
                ({initialDonationCount} Baseline Offline + {history.length} Platform Logged)
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 backdrop-blur-md px-4 py-2.5 border border-white/10 text-center sm:text-right">
            <div className="text-[10px] font-bold text-red-100 uppercase tracking-wider">
              Medical Cooldown
            </div>
            <div className="text-xs font-bold mt-0.5">
              {cooldownStatus.isEligible ? (
                <span className="text-emerald-300 flex items-center justify-center sm:justify-end gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Eligible to Donate
                </span>
              ) : (
                <span className="text-amber-300 flex items-center justify-center sm:justify-end gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> In Cooldown ({cooldownStatus.daysRemaining}d left)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Separates Status/History from Info Settings) */}
      <div className="flex rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 p-1.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-white text-zinc-900 shadow-md dark:bg-zinc-900 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4 text-red-500" />
          Status & History Log
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-zinc-900 shadow-md dark:bg-zinc-900 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4 text-zinc-500" />
          Personal & Location Info
        </button>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* TAB 1: Status & History Tracker */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {/* Medical Restriction Banner */}
          {!cooldownStatus.isEligible && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300/80 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 p-4 text-xs font-medium text-amber-800 dark:text-amber-300 shadow-sm">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong>Medical Restriction Active:</strong> You donated blood on{' '}
                <strong>{lastDonationDate}</strong>. For your health and physical recovery, you must complete the{' '}
                {cooldownStatus.requiredDays}-day cooldown ({cooldownStatus.daysRemaining} days remaining, eligible on{' '}
                <strong>{cooldownStatus.nextEligibleDateStr}</strong>).
              </div>
            </div>
          )}

          {cooldownAlertMsg && cooldownStatus.isEligible && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>{cooldownAlertMsg}</div>
            </div>
          )}

          {/* Instant Availability Switch card */}
          <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  Donation Status
                  {togglingAvailability && <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />}
                </p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {effectiveIsAvailable
                    ? 'You are ready to donate blood (Instantly updated)'
                    : !cooldownStatus.isEligible
                    ? `Unavailable (In Cooldown — eligible in ${cooldownStatus.daysRemaining} days)`
                    : 'You are currently set as unavailable'}
                </p>
              </div>
              <button
                type="button"
                disabled={togglingAvailability}
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none disabled:opacity-50 ${
                  effectiveIsAvailable ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
                role="switch"
                aria-checked={effectiveIsAvailable}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    effectiveIsAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Baseline Donation Count Card */}
          <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Baseline Past Donations (Offline)
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  How many times did you donate blood before joining Roktodan.online?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={pendingBaselineInput}
                  onChange={(e) => setPendingBaselineInput(e.target.value)}
                  placeholder="e.g. 18"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleOpenBaselineModal}
                className="h-12 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all cursor-pointer shrink-0"
              >
                Set Count
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Current confirmed baseline: <strong>{initialDonationCount} times</strong>
            </p>
          </div>

          {/* Donation History Section Component */}
          <DonationHistorySection
            userId={initialProfile.id}
            gender={gender}
            initialHistory={history}
            onHistoryChange={handleHistoryChange}
          />
        </div>
      )}

      {/* TAB 2: Personal & Location Information Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Personal & Health Information
            </h3>

            <div>
              <FieldLabel>Full Name</FieldLabel>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Blood Group</FieldLabel>
                <SelectField value={bloodGroup} onChange={setBloodGroup}>
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div>
                <FieldLabel>Gender (Medical Cooldown)</FieldLabel>
                <SelectField value={gender} onChange={setGender}>
                  <option value="male">Male (90-day cooldown)</option>
                  <option value="female">Female (120-day cooldown)</option>
                </SelectField>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Mobile</FieldLabel>
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
                <FieldLabel>Last Donation Date</FieldLabel>
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

          {/* Location */}
          <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Location
            </h3>

            <div>
              <FieldLabel>Division</FieldLabel>
              <SelectField value={division} onChange={handleDivisionChange}>
                <option value="">Select</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>District</FieldLabel>
                <SelectField
                  value={district}
                  onChange={handleDistrictChange}
                  disabled={!division}
                >
                  <option value="">Select</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div>
                <FieldLabel>Upazila</FieldLabel>
                <SelectField value={upazila} onChange={setUpazila} disabled={!district}>
                  <option value="">Select</option>
                  {upazilas.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Personal & Location Info
              </>
            )}
          </button>
        </form>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        count={parseInt(pendingBaselineInput, 10) || 0}
        onConfirm={handleConfirmBaseline}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  )
}
