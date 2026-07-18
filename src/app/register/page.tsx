'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { bangladeshData, bloodGroups } from '@/utils/bangladeshData'
import { Heart, User, Mail, Lock, Phone, Loader2, Eye, EyeOff, ChevronDown, Calendar, CheckCircle } from 'lucide-react'

const inputClass =
  'block w-full h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

const selectClass =
  'block w-full h-12 appearance-none rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-900/30 disabled:opacity-40 transition-all cursor-pointer'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
      {children}
    </label>
  )
}

function SelectWrap({
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
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const divisions = Object.keys(bangladeshData)
  const districts = division ? Object.keys(bangladeshData[division] || {}) : []
  const upazilas = division && district ? bangladeshData[division][district] || [] : []

  const handleDivisionChange = (val: string) => { setDivision(val); setDistrict(''); setUpazila('') }
  const handleDistrictChange = (val: string) => { setDistrict(val); setUpazila('') }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !bloodGroup || !phone.trim() || !division || !district || !upazila) {
      setErrorMsg('Please fill in all required fields before continuing.')
      return
    }
    setErrorMsg('')
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

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

      setSuccess(true)
      if (data?.session) {
        setTimeout(() => { router.push('/dashboard'); router.refresh() }, 1200)
      } else {
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Logo pill */}
      <div className="flex items-center justify-center pt-6 pb-4">
        <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 px-4 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-sm font-bold text-red-700 dark:text-red-400">Roktodan.online</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl p-6 sm:p-8">
            {/* Header */}
            <div className="mb-5 text-center">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {success ? 'All Done! 🎉' : 'Become a Donor'}
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {success
                  ? 'Your account has been created.'
                  : step === 1
                    ? 'Step 1 of 2 — Personal info & location'
                    : 'Step 2 of 2 — Create your account'}
              </p>
            </div>

            {/* Step progress */}
            {!success && (
              <div className="flex gap-1.5 mb-5">
                <div className="flex-1 h-1 rounded-full bg-red-600" />
                <div className={`flex-1 h-1 rounded-full transition-colors ${step === 2 ? 'bg-red-600' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
                  Redirecting to your dashboard…
                </p>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait
                </div>
              </div>
            ) : step === 1 ? (
              /* STEP 1 */
              <form onSubmit={handleStep1Next} className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahim Uddin"
                      autoComplete="name"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Blood Group *</Label>
                    <SelectWrap value={bloodGroup} onChange={setBloodGroup}>
                      <option value="">Select</option>
                      {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                    </SelectWrap>
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <SelectWrap value={gender} onChange={setGender}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </SelectWrap>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Mobile Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        autoComplete="tel"
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

                <div>
                  <Label>Division *</Label>
                  <SelectWrap value={division} onChange={handleDivisionChange}>
                    <option value="">Select Division</option>
                    {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </SelectWrap>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>District *</Label>
                    <SelectWrap value={district} onChange={handleDistrictChange} disabled={!division}>
                      <option value="">Select</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </SelectWrap>
                  </div>
                  <div>
                    <Label>Upazila *</Label>
                    <SelectWrap value={upazila} onChange={setUpazila} disabled={!district}>
                      <option value="">Select</option>
                      {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                    </SelectWrap>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:from-red-700 hover:to-red-600 active:scale-[0.98] transition-all mt-2"
                >
                  Continue →
                </button>
              </form>
            ) : (
              /* STEP 2 */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Email *</Label>
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
                  <Label>Password *</Label>
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
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrorMsg('') }}
                    className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:bg-zinc-800 px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md hover:from-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      'Register as Donor'
                    )}
                  </button>
                </div>
              </form>
            )}

            {!success && (
              <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
