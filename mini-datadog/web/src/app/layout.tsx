import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, Radio, ShieldCheck } from 'lucide-react'

import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
import { navItems, systemBadges } from "@/components/observability/dashboard"

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
        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/80 px-4 py-5 backdrop-blur-xl lg:block">
            <Link href="/" className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="rounded-md bg-cyan-400/10 p-2 ring-1 ring-cyan-300/20">
                <ShieldCheck className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-50">Mini Datadog</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Ops Console</p>
              </div>
            </Link>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-50"
                  >
                    <Icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-cyan-200" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Runtime</span>
                <Badge variant="outline" className="border-emerald-400/30 bg-emerald-500/10 text-[10px] text-emerald-200">
                  alpha
                </Badge>
              </div>
              {systemBadges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div key={badge.label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Icon className="h-3.5 w-3.5" />
                      {badge.label}
                    </span>
                    <span className="font-mono text-slate-300">{badge.value}</span>
                  </div>
                )
              })}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
              <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-8">
                <div className="flex items-center gap-3 lg:hidden">
                  <ShieldCheck className="h-5 w-5 text-cyan-200" />
                  <span className="font-bold text-slate-50">Mini Datadog</span>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                  <Radio className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm font-medium text-slate-200">Production observability workspace</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-cyan-400/30 bg-cyan-500/10 text-cyan-100">
                    <Activity className="mr-1.5 h-3 w-3" />
                    Live ready
                  </Badge>
                  <Badge variant="outline" className="border-violet-400/30 bg-violet-500/10 text-violet-100">
                    DuckDB local
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
                    v0.1.0-alpha
                  </Badge>
                </div>
              </div>
              <nav className="flex gap-1 overflow-x-auto border-t border-slate-800/60 px-3 py-2 lg:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-50">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </header>
            <main className="flex-1 px-4 py-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  )
}
