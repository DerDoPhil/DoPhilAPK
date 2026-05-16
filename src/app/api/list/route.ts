import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPO = 'DerDoPhil/DoPhilAPK'

export type APKEntry = {
  id: number
  url: string
  label: string
  size: number
  uploadedAt: string
}

export type GroupedAPKs = Record<string, APKEntry[]>

export async function GET() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, {
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'DoPhilAPK/1.0',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'GitHub API error' }, { status: 502 })
  }

  const releases: GHRelease[] = await res.json()
  const grouped: GroupedAPKs = {}

  for (const release of releases) {
    const project = release.tag_name
    const apks = release.assets
      .filter((a) => a.name.endsWith('.apk'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((a) => ({
        id: a.id,
        url: a.browser_download_url,
        label: a.name.replace(/\.apk$/i, ''),
        size: a.size,
        uploadedAt: a.created_at,
      }))

    if (apks.length > 0) grouped[project] = apks
  }

  return NextResponse.json(grouped)
}

type GHRelease = {
  tag_name: string
  assets: {
    id: number
    name: string
    size: number
    browser_download_url: string
    created_at: string
  }[]
}
