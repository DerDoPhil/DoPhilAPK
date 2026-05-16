import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { blobs } = await list()

  const apks = blobs
    .filter((b) => b.pathname.endsWith('.apk') || b.pathname.includes('android'))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((b) => ({
      url: b.url,
      pathname: b.pathname,
      label: decodeLabel(b.pathname),
      size: b.size,
      uploadedAt: b.uploadedAt,
    }))

  return NextResponse.json(apks)
}

function decodeLabel(pathname: string): string {
  // Format: timestamp_label.apk → extract label part
  const name = pathname.split('/').pop() || pathname
  const match = name.match(/^\d+_(.+)$/)
  return match ? match[1].replace(/_/g, ' ').replace(/\.apk$/, '') : name.replace(/\.apk$/, '')
}
