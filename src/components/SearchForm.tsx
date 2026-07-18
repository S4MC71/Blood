'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { bangladeshData, bloodGroups } from '@/utils/bangladeshData'
import { Search, RefreshCw, ChevronDown } from 'lucide-react'

const selectClass =
  'w-full h-12 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 appearance-none focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-900/30 disabled:opacity-40 transition-all cursor-pointer'

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  )
}

export default function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [bloodGroup, setBloodGroup] = useState(searchParams.get('blood_group') || '')
  const [division, setDivision] = useState(searchParams.get('division') || '')
  const [district, setDistrict] = useState(searchParams.get('district') || '')
  const [upazila, setUpazila] = useState(searchParams.get('upazila') || '')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (bloodGroup) params.set('blood_group', bloodGroup)
    if (division) params.set('division', division)
    if (district) params.set('district', district)
    if (upazila) params.set('upazila', upazila)
    router.push(`/?${params.toString()}`)
  }

  const handleReset = () => {
    setBloodGroup('')
    setDivision('')
    setDistrict('')
    setUpazila('')
    router.push('/')
  }

  const hasFilter = bloodGroup || division || district || upazila

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 dark:border-zinc-800 dark:bg-zinc-900/80 backdrop-blur-xl">
      <form onSubmit={handleSubmit}>
        <div className="p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
            Filter
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Blood Group */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Blood Group
              </label>
              <SelectWrapper>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All Groups</option>
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>

            {/* Division */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Division
              </label>
              <SelectWrapper>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All Divisions</option>
                  {divisions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                District
              </label>
              <SelectWrapper>
                <select
                  value={district}
                  disabled={!division}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>

            {/* Upazila */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Upazila
              </label>
              <SelectWrapper>
                <select
                  value={upazila}
                  disabled={!district}
                  onChange={(e) => setUpazila(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All Upazilas</option>
                  {upazilas.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:px-5 bg-zinc-50/50 dark:bg-zinc-800/20">
          {hasFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
          <button
            type="submit"
            className="ml-auto flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 transition-all cursor-pointer shadow-md shadow-red-500/20"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </form>
    </div>
  )
}
