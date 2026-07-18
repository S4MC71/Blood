'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getCooldownStatus } from '@/utils/donationUtils'
import { Calendar, Plus, Trash2, Loader2, Hospital, History, CheckCircle2, AlertCircle, X } from 'lucide-react'

export interface DonationRecord {
  id: string
  donation_date: string
  note: string | null
  created_at?: string
}

interface DonationHistorySectionProps {
  userId: string
  gender: string
  initialHistory: DonationRecord[]
  onHistoryChange: (updatedHistory: DonationRecord[]) => void
}

const inputClass =
  'block w-full h-11 rounded-xl border border-zinc-200 bg-white/80 px-3.5 text-xs font-medium text-zinc-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:focus:border-red-500 dark:focus:bg-zinc-800 dark:focus:ring-red-900/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

export default function DonationHistorySection({
  userId,
  gender,
  initialHistory,
  onHistoryChange,
}: DonationHistorySectionProps) {
  const supabase = createClient()
  const [history, setHistory] = useState<DonationRecord[]>(initialHistory)
  const [newDate, setNewDate] = useState('')
  const [newNote, setNewNote] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Confirmation modal states
  const [showAddConfirm, setShowAddConfirm] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<DonationRecord | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  // Form submit opens confirmation modal
  const handleOpenAddConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) return
    setShowAddConfirm(true)
  }

  // Actual insert executed after user confirms in modal
  const executeAddDonation = async () => {
    setShowAddConfirm(false)
    setAdding(true)
    setMsg(null)

    try {
      // 1. Insert record into Supabase donation_history
      const { data, error } = await supabase
        .from('donation_history')
        .insert({
          user_id: userId,
          donation_date: newDate,
          note: newNote.trim() || null,
        })
        .select('*')
        .single()

      if (error) throw error

      const updated = [data, ...history].sort(
        (a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime()
      )

      // 2. Automatically sync latest donation date & availability status in profiles table
      const latestDate = updated[0]?.donation_date || null
      const status = getCooldownStatus(latestDate, gender)

      await supabase
        .from('profiles')
        .update({
          last_donation_date: latestDate,
          is_available: status.isEligible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      setHistory(updated)
      onHistoryChange(updated)
      setNewDate('')
      setNewNote('')
      setMsg({ type: 'success', text: 'New blood donation logged successfully!' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save donation record in Supabase.' })
    } finally {
      setAdding(false)
    }
  }

  // Actual delete executed after user confirms in delete modal
  const executeDeleteDonation = async () => {
    if (!recordToDelete) return
    const id = recordToDelete.id
    setRecordToDelete(null)
    setDeletingId(id)
    setMsg(null)

    try {
      const { error } = await supabase.from('donation_history').delete().eq('id', id)
      if (error) throw error

      const updated = history.filter((item) => item.id !== id)

      // Update profiles last_donation_date to next latest if deleted item was latest
      const latestDate = updated[0]?.donation_date || null
      const status = getCooldownStatus(latestDate, gender)

      await supabase
        .from('profiles')
        .update({
          last_donation_date: latestDate,
          is_available: status.isEligible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      setHistory(updated)
      onHistoryChange(updated)
      setMsg({ type: 'success', text: 'Donation record removed.' })
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Failed to remove record.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              Donation History Log & Timeline
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Logged dates of blood donations made through Roktodan.online
            </p>
          </div>
        </div>
        <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold text-red-600 dark:text-red-400">
          {history.length} {history.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {msg && (
        <div
          className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 ${
            msg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400'
          }`}
        >
          {msg.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
          {msg.text}
        </div>
      )}

      {/* Add New Record Form */}
      <form onSubmit={handleOpenAddConfirm} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40 p-3.5 sm:p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          + Log New Donation Date
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Donation Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                required
                max={todayStr}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Hospital / Location / Note
            </label>
            <div className="relative">
              <Hospital className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Dhaka Medical College Hospital"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={adding || !newDate}
          className="flex h-10 w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          {adding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add Donation Log
        </button>
      </form>

      {/* History Records List */}
      {history.length === 0 ? (
        <div className="py-6 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          No platform donation logs recorded yet. Use the form above to record your latest donation date!
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {history.map((record) => {
            const formattedDate = new Date(record.donation_date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-800/80 p-3 shadow-2xs hover:border-red-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">
                      {formattedDate}
                    </div>
                    {record.note ? (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs">
                        {record.note}
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-400 italic">No notes</div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={deletingId === record.id}
                  onClick={() => setRecordToDelete(record)}
                  title="Remove entry"
                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  {deletingId === record.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal for Adding Donation Log */}
      {showAddConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Confirm New Donation Log
              </h3>
              <button
                type="button"
                onClick={() => setShowAddConfirm(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              Are you sure you want to log a new blood donation on{' '}
              <strong className="text-red-600 dark:text-red-400 font-bold">{newDate}</strong>
              {newNote ? ` at "${newNote}"` : ''}?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddConfirm(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAddDonation}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
              >
                Confirm & Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Donation Log */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirm Deletion
              </h3>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              Are you sure you want to delete the donation record for{' '}
              <strong className="text-red-600 dark:text-red-400 font-bold">
                {recordToDelete.donation_date}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteDonation}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
