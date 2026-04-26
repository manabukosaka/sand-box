import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mini Datadog',
  description: 'Lightweight monitoring and observability platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🐕 Mini Datadog</h1>
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem' }}>
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Live Tail</a>
            <a href="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Logs Search</a>
            <a href="/metrics" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.6 }}>Metrics</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
