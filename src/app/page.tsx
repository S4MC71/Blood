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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
      <span className="text-sm font-extrabold leading-none text-red-600 dark:text-red-400">
        {group}
      </span>
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

    // 1. Fetch all profiles for community stats
    const { data: allProfiles } = await supabase.from('profiles').select('*')
    const { data: allHistory } = await supabase.from('donation_history').select('user_id')

    // Calculate history counts per donor
    const historyCountMap: Record<string, number> = {}
    if (allHistory) {
      allHistory.forEach((item) => {
        historyCountMap[item.user_id] = (historyCountMap[item.user_id] || 0) + 1
      })
    }

    if (allProfiles) {
      totalRegisteredDonors = allProfiles.length
      allProfiles.forEach((p) => {
        const baseline = p.initial_donation_count || 0
        const logged = historyCountMap[p.id] || 0
        totalCommunityDonations += baseline + logged

        const status = getCooldownStatus(p.last_donation_date, p.gender)
        if (p.is_available && status.isEligible) {
          availableDonorsNow += 1
        }
      })
    }

    // 2. Fetch filtered donors for search grid
    let query = supabase
      .from('profiles')
      .select('*')
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
    <div className="flex-1 bg-transparent">
      {/* Hero */}
      <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl border-b border-red-100 dark:border-zinc-800 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:pt-10 sm:pb-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-red-600 to-rose-500 shadow-md shadow-red-500/30">
                <Heart className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                Roktodan.online
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Find Blood Donor
            </h1>
            <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
              Select blood group and location to connect directly with active blood donors.
            </p>
          </div>

          {/* Search Form */}
          <div className="mt-5">
            <Suspense
              fallback={
                <div className="h-36 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              }
            >
              <SearchForm />
            </Suspense>
          </div>

          {/* Community Global Stats Banner */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-600 to-rose-600 p-4 text-white shadow-md flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
                <Droplets className="h-6 w-6 fill-white text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold leading-tight">
                  {totalCommunityDonations} <span className="text-sm font-semibold text-red-100">Times</span>
                </div>
                <div className="text-[11px] font-bold text-red-100 uppercase tracking-wider">
                  Total Blood Donated Site-Wide
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 text-zinc-900 dark:text-white shadow-sm flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold leading-tight">{totalRegisteredDonors}</div>
                <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Registered Donors
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 text-zinc-900 dark:text-white shadow-sm flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold leading-tight text-emerald-600 dark:text-emerald-400">
                  {availableDonorsNow}
                </div>
                <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Available Donors Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Result header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isFiltered ? 'Search Results' : 'All Blood Donors'}
            </h2>
            <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
              {donors.length} found
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {donors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4 shadow-inner">
              <MapPin className="h-7 w-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1.5">
              No blood donors found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Change your filter or search in a broader area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {donors.map((donor) => {
              const cooldownStatus = getCooldownStatus(donor.last_donation_date, donor.gender)
              const canCall = donor.is_available && cooldownStatus.isEligible

              // Total donor count (baseline + logged history)
              const donorTotalCount = (donor.initial_donation_count || 0) + (donor.history_count || 0)

              return (
                <div
                  key={donor.id}
                  className="group flex flex-col rounded-3xl border border-zinc-200/60 bg-white/80 dark:border-zinc-800/60 dark:bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300"
                >
                  {/* Card Top */}
                  <div className="p-4 flex items-start gap-3">
                    {/* Blood Group Badge */}
                    <BloodGroupBadge group={donor.blood_group} />

                    {/* Name & Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight truncate">
                          {donor.full_name}
                        </h3>
                        {/* Total Donations Badge */}
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[11px] font-extrabold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                          <Award className="h-3 w-3" />
                          {donorTotalCount} Times
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            donor.is_available && cooldownStatus.isEligible
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : 'bg-zinc-300 dark:bg-zinc-600'
                          }`}
                        />
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {donor.is_available && cooldownStatus.isEligible
                            ? 'Ready to donate'
                            : 'Currently unavailable'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {donor.upazila}, {donor.district}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donation info bar */}
                  <div className="border-t border-zinc-100/60 dark:border-zinc-800/60 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center gap-1.5">
                    {cooldownStatus.daysSince === null ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          First time donor
                        </span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Donated {cooldownStatus.daysSince}d ago
                        </span>
                        {!cooldownStatus.isEligible && (
                          <span className="ml-auto text-xs font-bold text-amber-600 dark:text-amber-400">
                            Available in {cooldownStatus.daysRemaining}d
                          </span>
                        )}
                        {cooldownStatus.isEligible && (
                          <span className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Eligible ✓
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Call Button */}
                  <div className="p-3 pt-2">
                    <a
                      href={canCall ? `tel:${donor.phone}` : undefined}
                      className={`flex w-full h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        canCall
                          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-[0.98]'
                          : 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800/60 dark:text-zinc-600'
                      }`}
                    >
                      <Phone className={`h-4 w-4 ${canCall ? 'fill-white/20' : ''}`} />
                      {canCall ? `Call: ${donor.phone}` : 'Not available now'}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer CTA for donors */}
        {!isFiltered && donors.length > 0 && (
          <div className="mt-12 rounded-3xl border border-red-200/50 bg-gradient-to-br from-red-50 to-white dark:border-red-900/30 dark:from-red-950/20 dark:to-zinc-900/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Want to become a donor?
              </h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                Register for free and save lives.
              </p>
            </div>
            <Link
              href="/register"
              className="shrink-0 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-6 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Heart className="h-4 w-4 fill-white/20" />
              Join Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
