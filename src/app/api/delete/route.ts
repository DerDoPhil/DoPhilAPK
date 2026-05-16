import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPO = 'DerDoPhil/DoPhilAPK'

// Delete is unprotected on the client — the actual GitHub token lives server-side only.
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const assetId = body?.assetId

  if (!assetId || typeof assetId !== 'number') {
    return NextResponse.json({ error: 'No assetId provided' }, { status: 400 })
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${assetId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'DoPhilAPK/1.0',
    },
  })

  if (!res.ok && res.status !== 204) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 502 })
  }

  return NextResponse.json({ deleted: true })
}
