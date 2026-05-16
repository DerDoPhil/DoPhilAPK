import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const secret = req.headers.get('x-upload-secret')
  if (secret !== process.env.UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'No url provided' }, { status: 400 })

  await del(url)
  return NextResponse.json({ deleted: true })
}
