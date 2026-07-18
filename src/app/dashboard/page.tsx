import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardForm from '@/components/DashboardForm'
import { Heart, Mail, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Profile Not Loaded</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your information could not be found. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-transparent pb-10">
      {/* Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white px-4 py-8 sm:py-10 shadow-md">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-100 mb-1 drop-shadow-sm">
                Donor Dashboard
              </p>
              <h1 className="text-2xl font-extrabold leading-tight drop-shadow-sm">
                Welcome, {profile.full_name.split(' ')[0]}!
              </h1>
              <p className="text-sm text-red-50 mt-1 flex items-center gap-1.5 drop-shadow-sm">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/10">
              <div className="text-center">
                <div className="text-[10px] font-bold text-red-100 uppercase">Group</div>
                <div className="text-2xl font-extrabold text-white drop-shadow-md">{profile.blood_group}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="mx-auto max-w-lg px-4 pt-5">
        <DashboardForm initialProfile={profile} />
      </div>
    </div>
  )
}
