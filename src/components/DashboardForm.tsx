'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { bangladeshData, bloodGroups } from '@/utils/bangladeshData'
import { Save, User, Phone, Calendar, Loader2, ChevronDown, CheckCircle } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  blood_group: string
  phone: string
  division: string
  district: string
  upazila: string
  last_donation_date: string | null
  is_available: boolean
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

function SelectField({ value, onChange, disabled = false, children }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; children: React.ReactNode
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

export default function DashboardForm({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [bloodGroup, setBloodGroup] = useState(initialProfile.blood_group || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [division, setDivision] = useState(initialProfile.division || '')
  const [district, setDistrict] = useState(initialProfile.district || '')
  const [upazila, setUpazila] = useState(initialProfile.upazila || '')
  const [lastDonationDate, setLastDonationDate] = useState(initialProfile.last_donation_date || '')
  const [isAvailable, setIsAvailable] = useState(initialProfile.is_available)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const divisions = Object.keys(bangladeshData)
  const districts = division ? Object.keys(bangladeshData[division] || {}) : []
  const upazilas = division && district ? bangladeshData[division][district] || [] : []

  const handleDivisionChange = (val: string) => { setDivision(val); setDistrict(''); setUpazila('') }
  const handleDistrictChange = (val: string) => { setDistrict(val); setUpazila('') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          blood_group: bloodGroup,
          phone,
          division,
          district,
          upazila,
          last_donation_date: lastDonationDate || null,
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialProfile.id)

      if (error) throw error

      setSuccessMsg('Profile updated successfully!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
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

      {/* Availability toggle — most important, at top */}
      <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-zinc-900 dark:text-white">Donation Status</p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isAvailable ? 'You are ready to donate' : 'You are currently unavailable'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
              isAvailable ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
            role="switch"
            aria-checked={isAvailable}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Personal Info */}
      <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm p-5 space-y-4 mt-4">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Personal Information
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
              {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </SelectField>
          </div>
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
          <p className="mt-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            Leave blank if you've never donated
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm p-5 space-y-4 mt-4">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Location
        </h3>

        <div>
          <FieldLabel>Division</FieldLabel>
          <SelectField value={division} onChange={handleDivisionChange}>
            <option value="">Select</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>District</FieldLabel>
            <SelectField value={district} onChange={handleDistrictChange} disabled={!division}>
              <option value="">Select</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </SelectField>
          </div>
          <div>
            <FieldLabel>Upazila</FieldLabel>
            <SelectField value={upazila} onChange={setUpazila} disabled={!district}>
              <option value="">Select</option>
              {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
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
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="h-4 w-4" /> Save Information</>
        )}
      </button>
    </form>
  )
}
