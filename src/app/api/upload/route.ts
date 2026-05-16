import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-upload-secret')
  if (secret !== process.env.UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const label = (formData.get('label') as string) || file?.name || 'unknown.apk'
  const project = ((formData.get('project') as string) || 'Sonstige')
    .replace(/[^a-zA-Z0-9_-]/g, '_')

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const safeName = label.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${project}/${Date.now()}_${safeName}`

  const blob = await put(filename, file, {
    access: 'public',
    contentType: 'application/vnd.android.package-archive',
  })

  return NextResponse.json({ url: blob.url, filename, project, label })
}
