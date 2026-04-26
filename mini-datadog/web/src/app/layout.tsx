import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/sonner"
import Link from 'next/link'
import { ShieldCheck, Activity, Search, BarChart3 } from 'lucide-react'

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
    <html lang="en" className="dark antialiased">
      <body className="min-h-screen bg-background font-sans text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <Link href="/" className="flex items-center space-x-2 mr-10">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="inline-block font-bold text-xl tracking-tight">Mini Datadog</span>
              </Link>
              <nav className="flex items-center space-x-1 text-sm font-medium">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors hover:bg-slate-800 text-foreground"
                >
                  <Activity className="h-4 w-4" />
                  <span>Live Tail</span>
                </Link>
                <Link 
                  href="/search" 
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors hover:bg-slate-800 text-slate-400 hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                  <span>Logs Search</span>
                </Link>
                <Link 
                  href="/metrics" 
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors hover:bg-slate-800 text-slate-400 hover:text-foreground opacity-50 cursor-not-allowed"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Metrics</span>
                </Link>
              </nav>
              <div className="ml-auto flex items-center space-x-4">
                <Badge variant="outline" className="hidden md:flex bg-slate-900 border-slate-800 text-slate-400">
                  v0.1.0-alpha
                </Badge>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="container py-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-slate-800 py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
              <p className="text-sm text-slate-500">
                &copy; 2024 Mini Datadog. Built for high-performance observability.
              </p>
            </div>
          </footer>
        </div>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  )
}

import { Badge } from "@/components/ui/badge"
