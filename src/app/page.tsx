import SearchForm from '@/components/SearchForm'
import { createClient } from '@/utils/supabase/server'
import { getCooldownStatus } from '@/utils/donationUtils'
import { MapPin, Phone, Calendar, Heart, Clock, Droplets, Users, ShieldCheck, Award } from 'lucide-react'
import { Suspense } from 'react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    blood_group?: string
    division?: string
    district?: string
    upazila?: string
  }>
}

function BloodGroupBadge({ group }: { group: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40">
      <span className="text-xs font-extrabold leading-none text-red-600 dark:text-red-400">
        {group}
      </span>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  accent?: boolean
}) {
  if (accent) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 p-4 text-white shadow-lg flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 border border-white/20">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-extrabold leading-tight">{value}</div>
          <div className="text-[11px] font-bold text-red-100 uppercase tracking-wider mt-0.5">{label}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:border-zinc-800/70 dark:bg-zinc-900/80 backdrop-blur-xl p-4 flex items-center gap-3 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold leading-tight text-zinc-900 dark:text-white">{value}</div>
        <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 truncate">{label}</div>
      </div>
    </div>
  )
}

export default async function Home({ searchParams }: PageProps) {
  const resolved = await searchParams
  const bloodGroup = resolved.blood_group || ''
  const division = resolved.division || ''
  const district = resolved.district || ''
  const upazila = resolved.upazila || ''
  const isFiltered = !!(bloodGroup || division || district || upazila)

  let donors: any[] = []
  let totalCommunityDonations = 0
  let totalRegisteredDonors = 0
  let availableDonorsNow = 0
  let errorMsg = ''

  try {
    const supabase = await createClient()

    const { data: allProfiles } = await supabase.from('profiles').select('*')
    const { data: allHistory } = await supabase.from('donation_history').select('user_id')

    if (allHistory) {
      totalCommunityDonations = allHistory.length
    }

    if (allProfiles) {
      totalRegisteredDonors = allProfiles.length
      allProfiles.forEach((p) => {
        const status = getCooldownStatus(p.last_donation_date, p.gender)
        if (p.is_available && status.isEligible) availableDonorsNow++
      })
    }

    let query = supabase
      .from('profiles')
      .select('*, donation_history(count)')
      .order('is_available', { ascending: false })
      .order('created_at', { ascending: false })

    if (bloodGroup) query = query.eq('blood_group', bloodGroup)
    if (division) query = query.eq('division', division)
    if (district) query = query.eq('district', district)
    if (upazila) query = query.eq('upazila', upazila)

    const { data, error } = await query
    if (error) throw error
    donors = data || []
  } catch {
    errorMsg = 'Failed to load data. Please refresh the page.'
  }

  return (
    <div className="flex-1 w-full max-w-full overflow-x-hidden">
      {/* Hero / Search Section */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border-b border-red-100/60 dark:border-zinc-800 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 pt-6 pb-7 sm:pt-10 sm:pb-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-red-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-rose-400/15 blur-3xl pointer-events-none" />



          <div className="relative z-10">
            <h1 className="text-[1.7rem] leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
              Find a Blood Donor
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              Search by blood group and location to connect directly with active donors.
            </p>
          </div>

          <div className="mt-5 sm:mt-6">
            <Suspense fallback={
              <div className="h-[140px] w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            }>
              <SearchForm />
            </Suspense>
          </div>

          <div className="mt-5 sm:mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              accent
              icon={<Droplets className="h-5 w-5 fill-white text-white" />}
              value={totalCommunityDonations}
              label="Total Donations (Platform)"
            />
            <StatCard
              icon={<Users className="h-5 w-5 text-red-500" />}
              value={totalRegisteredDonors}
              label="Registered Donors"
            />
            <StatCard
              icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
              value={availableDonorsNow}
              label="Available Right Now"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white sm:text-lg">
            {isFiltered ? 'Search Results' : 'All Donors'}
          </h2>
          <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
            {donors.length} found
          </span>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {donors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
              <MapPin className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
              No donors found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              Try a different blood group or search in a broader area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {donors.map((donor) => {
              const cooldown = getCooldownStatus(donor.last_donation_date, donor.gender)
              const canCall = donor.is_available && cooldown.isEligible
              const platformDonations = donor.donation_history?.[0]?.count || 0
              const totalDonations = (donor.initial_donation_count || 0) + platformDonations

              return (
                <div
                  key={donor.id}
                  className="flex flex-col rounded-2xl border border-zinc-200/60 bg-white/90 dark:border-zinc-800/60 dark:bg-zinc-900/90 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-red-200/80 dark:hover:border-red-900/50 transition-all duration-300"
                >
                  <div className="p-3.5 sm:p-4 flex items-start gap-3">
                    <BloodGroupBadge group={donor.blood_group} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">
                          {donor.full_name}
                        </h3>
                        {totalDonations > 0 && (
                          <span title={`Donated ${totalDonations} times`} className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[10px] font-extrabold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 whitespace-nowrap">
                            <Award className="h-2.5 w-2.5" />
                            {totalDonations} Donations
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${canCall ? 'bg-emerald-500 pulse-dot' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {canCall ? 'Ready to donate' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {[donor.upazila, donor.district].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100/60 dark:border-zinc-800/60 px-3.5 py-2 bg-zinc-50/70 dark:bg-zinc-800/30 flex items-center gap-1.5">
                    {cooldown.daysSince === null ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          First time donor
                        </span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                          {cooldown.daysSince}d ago
                        </span>
                        <span className="ml-auto shrink-0">
                          {!cooldown.isEligible ? (
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              Avail. in {cooldown.daysRemaining}d
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              Eligible ✓
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="p-3">
                    <a
                      href={canCall ? `tel:${donor.phone}` : undefined}
                      className={`flex w-full h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        canCall
                          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow hover:from-red-700 hover:to-red-600 active:scale-[0.97]'
                          : 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800/60 dark:text-zinc-600 pointer-events-none'
                      }`}
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {canCall ? donor.phone : 'Not available now'}
                      </span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {donors.length > 0 && (
          <div className="mt-8 sm:mt-12 rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-white dark:border-red-900/30 dark:from-red-950/20 dark:to-zinc-900/50 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white sm:text-lg">
                Want to become a donor?
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Register for free and help save lives.
              </p>
            </div>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-6 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-red-700 active:scale-95 transition-all"
            >
              <Heart className="h-4 w-4 fill-white/20" />
              Register as Donor
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
