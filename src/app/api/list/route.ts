import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type APKEntry = {
  url: string
  pathname: string
  label: string
  size: number
  uploadedAt: string
}

export type GroupedAPKs = Record<string, APKEntry[]>

export async function GET() {
  const { blobs } = await list()

  const grouped: GroupedAPKs = {}

  for (const b of blobs) {
    if (!b.pathname.endsWith('.apk') && !b.pathname.includes('android')) continue

    const parts = b.pathname.split('/')
    const project = parts.length > 1 ? parts[0] : 'Sonstige'
    const filename = parts[parts.length - 1]

    const entry: APKEntry = {
      url: b.url,
      pathname: b.pathname,
      label: decodeLabel(filename),
      size: b.size,
      uploadedAt: b.uploadedAt instanceof Date ? b.uploadedAt.toISOString() : String(b.uploadedAt),
    }

    if (!grouped[project]) grouped[project] = []
    grouped[project].push(entry)
  }

  for (const project of Object.keys(grouped)) {
    grouped[project].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  }

  return NextResponse.json(grouped)
}

function decodeLabel(filename: string): string {
  const match = filename.match(/^\d+_(.+)$/)
  return match ? match[1].replace(/\.apk$/i, '') : filename.replace(/\.apk$/i, '')
}
