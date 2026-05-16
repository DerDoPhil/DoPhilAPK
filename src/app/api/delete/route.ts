import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// No secret required — delete is triggered only from the website UI by the owner.
// Blob URLs are random hashes and not enumerable without the list API.
export async function DELETE(req: NextRequest) {
  const { url } = await req.json().catch(() => ({}))
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'No url provided' }, { status: 400 })
  }

  await del(url)
  return NextResponse.json({ deleted: true })
}
