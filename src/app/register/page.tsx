'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { bangladeshData, bloodGroups } from '@/utils/bangladeshData'
import { Heart, User, Mail, Lock, Phone, Loader2, Eye, EyeOff, ChevronDown, Calendar } from 'lucide-react'

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

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [gender, setGender] = useState('male')
  const [phone, setPhone] = useState('')
  const [lastDonationDate, setLastDonationDate] = useState('')
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [upazila, setUpazila] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const divisions = Object.keys(bangladeshData)
  const districts = division ? Object.keys(bangladeshData[division] || {}) : []
  const upazilas = division && district ? bangladeshData[division][district] || [] : []

  const handleDivisionChange = (val: string) => {
    setDivision(val)
    setDistrict('')
    setUpazila('')
  }
  const handleDistrictChange = (val: string) => {
    setDistrict(val)
    setUpazila('')
  }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !bloodGroup || !gender || !phone || !division || !district || !upazila) {
      setErrorMsg('Please fill all required fields.')
      return
    }
    setErrorMsg('')
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            blood_group: bloodGroup,
            gender,
            phone,
            last_donation_date: lastDonationDate || null,
            division,
            district,
            upazila,
          },
        },
      })

      if (error) throw error

      if (data?.session) {
        setSuccessMsg('Registration successful! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      } else {
        setSuccessMsg('Registration successful! Please confirm your email.')
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Top icon */}
      <div className="flex items-center justify-center gap-2 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow">
          <Heart className="h-5 w-5 fill-current" />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-10 mt-2 sm:mt-8">
        <div className="w-full max-w-md rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 p-6 sm:p-8">
          {/* Header */}
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              Become a Donor
            </h1>
            <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {step === 1 ? 'Enter your personal info & location' : 'Create account details'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`flex-1 h-1 rounded-full transition-all ${
                step >= 1 ? 'bg-red-600' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
            <div
              className={`flex-1 h-1 rounded-full transition-all ${
                step >= 2 ? 'bg-red-600' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Donor Personal & Location Info */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div>
                <FieldLabel>Full Name *</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Blood Group *</FieldLabel>
                  <SelectField value={bloodGroup} onChange={setBloodGroup}>
                    <option value="">Select</option>
                    {bloodGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div>
                  <FieldLabel>Gender *</FieldLabel>
                  <SelectField value={gender} onChange={setGender}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </SelectField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Mobile Number *</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
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

              <div>
                <FieldLabel>Division *</FieldLabel>
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
                  <FieldLabel>District *</FieldLabel>
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
                  <FieldLabel>Upazila *</FieldLabel>
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

              <button
                type="submit"
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98] transition-all cursor-pointer mt-4"
              >
                Next Step →
              </button>
            </form>
          )}

          {/* STEP 2: Account Info */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <FieldLabel>Email *</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Password *</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    className={`${inputClass} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:bg-zinc-800 px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-sm"
                >
                  ← Go Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                    </>
                  ) : (
                    'Register as Donor'
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Already registered?{' '}
            <Link
              href="/login"
              className="font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
