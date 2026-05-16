'use client'

import { useEffect, useState } from 'react'

type APK = {
  url: string
  pathname: string
  label: string
  size: number
  uploadedAt: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Home() {
  const [apks, setApks] = useState<APK[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/list')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setApks(data)
        else setError('Fehler beim Laden der APKs')
        setLoading(false)
      })
      .catch(() => {
        setError('Verbindungsfehler')
        setLoading(false)
      })
  }, [])

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>📦</span>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            DoPhilAPK
          </h1>
        </div>
        <p style={{ margin: 0, color: '#888', fontSize: 15 }}>
          Philipis privater APK-Download-Hub
        </p>
      </div>

      {loading && (
        <p style={{ color: '#666', fontSize: 15 }}>Lade APKs…</p>
      )}

      {error && (
        <p style={{ color: '#f66', fontSize: 15 }}>{error}</p>
      )}

      {!loading && !error && apks.length === 0 && (
        <div style={{
          border: '1px dashed #333',
          borderRadius: 12,
          padding: '40px 24px',
          textAlign: 'center',
          color: '#555',
        }}>
          <p style={{ margin: 0, fontSize: 16 }}>Noch keine APKs hochgeladen.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {apks.map((apk, i) => (
          <div
            key={apk.url}
            style={{
              background: i === 0 ? '#1a2a1a' : '#161616',
              border: `1px solid ${i === 0 ? '#2d5a2d' : '#242424'}`,
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {i === 0 && (
                  <span style={{
                    background: '#2d5a2d',
                    color: '#7dbd7d',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 20,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    Neueste
                  </span>
                )}
                <span style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: '#f0f0f0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {apk.label}
                </span>
              </div>
              <div style={{ color: '#555', fontSize: 13 }}>
                {formatSize(apk.size)} · {formatDate(apk.uploadedAt)}
              </div>
            </div>

            <a
              href={apk.url}
              download
              style={{
                background: '#22c55e',
                color: '#000',
                fontWeight: 700,
                fontSize: 14,
                padding: '10px 20px',
                borderRadius: 8,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              ↓ Download
            </a>
          </div>
        ))}
      </div>

      {!loading && apks.length > 0 && (
        <p style={{ marginTop: 24, color: '#444', fontSize: 13, textAlign: 'center' }}>
          {apks.length} APK{apks.length !== 1 ? 's' : ''} verfügbar
        </p>
      )}
    </main>
  )
}
