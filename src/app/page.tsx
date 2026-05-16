'use client'

import { useEffect, useState, useCallback } from 'react'

type APKEntry = {
  id: number
  url: string
  label: string
  size: number
  uploadedAt: string
}

type GroupedAPKs = Record<string, APKEntry[]>

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// One distinct color per project, cycling through a palette
const PALETTE = ['#2563eb', '#7c3aed', '#0e7490', '#b45309', '#15803d', '#be185d']
const colorCache: Record<string, string> = {}
let colorIndex = 0
function projectColor(name: string): string {
  if (!colorCache[name]) colorCache[name] = PALETTE[colorIndex++ % PALETTE.length]
  return colorCache[name]
}

function APKCard({
  apk,
  isLatest,
  onDelete,
}: {
  apk: APKEntry
  isLatest: boolean
  onDelete: (id: number) => void
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`"${apk.label}" wirklich löschen?`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: apk.id }),
      })
      if (res.ok) onDelete(apk.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      style={{
        background: isLatest ? '#0d1f0d' : '#111',
        border: `1px solid ${isLatest ? '#1e4d1e' : '#1f1f1f'}`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          {isLatest && (
            <span
              style={{
                background: '#1a4d1a',
                color: '#6ee86e',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 20,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              Neueste
            </span>
          )}
          <span
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: '#e8e8e8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {apk.label}
          </span>
        </div>
        <div style={{ color: '#555', fontSize: 12 }}>
          {formatSize(apk.size)} · {formatDate(apk.uploadedAt)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a
          href={apk.url}
          download
          style={{
            background: '#16a34a',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 7,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          ↓ APK
        </a>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'transparent',
            border: '1px solid #3a1a1a',
            color: deleting ? '#555' : '#e05050',
            fontWeight: 600,
            fontSize: 14,
            padding: '8px 12px',
            borderRadius: 7,
            cursor: deleting ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!deleting) (e.currentTarget as HTMLButtonElement).style.background = '#2a0d0d'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>
    </div>
  )
}

function ProjectGroup({
  name,
  apks,
  onDelete,
}: {
  name: string
  apks: APKEntry[]
  onDelete: (id: number) => void
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: projectColor(name),
            flexShrink: 0,
          }}
        />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#ccc', letterSpacing: 0.3 }}>
          {name}
        </h2>
        <span style={{ color: '#444', fontSize: 13 }}>
          {apks.length} Version{apks.length !== 1 ? 'en' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {apks.map((apk, i) => (
          <APKCard key={apk.id} apk={apk} isLatest={i === 0} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [grouped, setGrouped] = useState<GroupedAPKs>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/list')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) setGrouped(data)
        else setError('Fehler beim Laden')
        setLoading(false)
      })
      .catch(() => {
        setError('Verbindungsfehler')
        setLoading(false)
      })
  }, [])

  const handleDelete = useCallback((id: number) => {
    setGrouped((prev) => {
      const next: GroupedAPKs = {}
      for (const [proj, apks] of Object.entries(prev)) {
        const filtered = apks.filter((a) => a.id !== id)
        if (filtered.length > 0) next[proj] = filtered
      }
      return next
    })
  }, [])

  const totalCount = Object.values(grouped).reduce((s, arr) => s + arr.length, 0)
  const projectNames = Object.keys(grouped).sort()
  const isEmpty = !loading && !error && totalCount === 0

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 32 }}>📦</span>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
            DoPhilAPK
          </h1>
        </div>
        <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
          Philipps privater APK-Download-Hub · {totalCount} APK{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && <p style={{ color: '#555', fontSize: 15 }}>Lade APKs…</p>}
      {error && <p style={{ color: '#f55', fontSize: 15 }}>{error}</p>}

      {isEmpty && (
        <div
          style={{
            border: '1px dashed #222',
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#444',
          }}
        >
          <p style={{ margin: 0, fontSize: 15 }}>Noch keine APKs hochgeladen.</p>
        </div>
      )}

      {projectNames.map((name) => (
        <ProjectGroup key={name} name={name} apks={grouped[name]} onDelete={handleDelete} />
      ))}
    </main>
  )
}
