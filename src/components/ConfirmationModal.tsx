'use client'

import { useState } from 'react'
import { ShieldCheck, AlertCircle, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  count: number
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  isOpen,
  count,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [agreed, setAgreed] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Confirm Baseline Count
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Self-declaration verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              Blood donation tracking relies on trust and truthfulness. Please ensure your past donation history count is correct before confirming.
            </div>
          </div>

          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            You are setting your baseline past blood donation count to{' '}
            <span className="font-extrabold text-red-600 dark:text-red-400 text-base">
              {count} {count === 1 ? 'time' : 'times'}
            </span>. Any future donations recorded on Roktodan.online will count on top of this.
          </p>

          <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              I affirm that I have previously donated blood {count} {count === 1 ? 'time' : 'times'} prior to using this platform.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreed}
            onClick={onConfirm}
            className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  )
}
