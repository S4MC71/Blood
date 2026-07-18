import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Verify admin secret header
    const authHeader = req.headers.get('x-admin-secret')
    const adminSecret = process.env.ADMIN_SECRET_PASSWORD

    if (!authHeader || authHeader !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, newPassword } = await req.json()
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Create Supabase admin client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
      return NextResponse.json(
        { error: 'Server not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Update the auth user password (requires service role)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
