import { NextRequest, NextResponse } from 'next/server'

// Dedicated endpoint just for verifying the admin password
// Returns 200 OK if correct, 401 if not
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-secret')
  const adminSecret = process.env.ADMIN_SECRET_PASSWORD

  if (!adminSecret) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
  }

  if (!authHeader || authHeader !== adminSecret) {
    // Add a small delay to prevent brute-force timing attacks
    await new Promise((r) => setTimeout(r, 500))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
