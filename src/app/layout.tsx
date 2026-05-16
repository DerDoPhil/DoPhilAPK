import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DoPhilAPK',
  description: 'APK Download Hub',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f0f0f', color: '#f0f0f0' }}>
        {children}
      </body>
    </html>
  )
}
