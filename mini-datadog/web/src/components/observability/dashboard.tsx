import * as React from "react"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDashed,
  Copy,
  Database,
  Gauge,
  Info,
  Server,
  Settings,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface LogRecord {
  timestamp: string
  level: string
  service: string
  message: string
  tags?: Record<string, unknown> | null
  attributes?: Record<string, unknown> | null
}

export interface MetricValue {
  timestamp: string
  value: number
}

export const levelOrder = ["error", "warn", "info", "debug"] as const

export function levelTone(level: string) {
  switch (level.toLowerCase()) {
    case "error":
      return "border-red-400/40 bg-red-500/10 text-red-300 shadow-red-950/20"
    case "warn":
      return "border-amber-400/40 bg-amber-500/10 text-amber-200 shadow-amber-950/20"
    case "info":
      return "border-sky-400/40 bg-sky-500/10 text-sky-200 shadow-sky-950/20"
    case "debug":
      return "border-violet-400/35 bg-violet-500/10 text-violet-200 shadow-violet-950/20"
    default:
      return "border-slate-500/40 bg-slate-500/10 text-slate-300"
  }
}

export function levelDot(level: string) {
  switch (level.toLowerCase()) {
    case "error":
      return "bg-red-400"
    case "warn":
      return "bg-amber-300"
    case "info":
      return "bg-sky-300"
    case "debug":
      return "bg-violet-300"
    default:
      return "bg-slate-400"
  }
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value)
}

export function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "--:--:--"
  return date.toLocaleTimeString([], { hour12: false })
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Invalid date"
  return date.toLocaleString([], { hour12: false })
}

export function summarizeLogs(logs: LogRecord[]) {
  const byLevel = Object.fromEntries(levelOrder.map((level) => [level, 0])) as Record<string, number>
  const byService = new Map<string, number>()
  logs.forEach((log) => {
    const level = log.level.toLowerCase()
    byLevel[level] = (byLevel[level] ?? 0) + 1
    byService.set(log.service || "unknown", (byService.get(log.service || "unknown") ?? 0) + 1)
  })
  return {
    total: logs.length,
    errors: byLevel.error ?? 0,
    warnings: byLevel.warn ?? 0,
    errorRate: logs.length ? Math.round(((byLevel.error ?? 0) / logs.length) * 100) : 0,
    services: byService.size,
    byLevel,
    topServices: Array.from(byService.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6),
  }
}

export function timelineBuckets(logs: LogRecord[], bucketCount = 24) {
  if (logs.length === 0) return Array.from({ length: bucketCount }, () => 0)
  const times = logs.map((log) => new Date(log.timestamp).getTime()).filter(Number.isFinite)
  if (times.length === 0) return Array.from({ length: bucketCount }, () => 0)
  const min = Math.min(...times)
  const max = Math.max(...times)
  const span = Math.max(max - min, 1)
  const buckets = Array.from({ length: bucketCount }, () => 0)
  times.forEach((time) => {
    const index = Math.min(bucketCount - 1, Math.floor(((time - min) / span) * bucketCount))
    buckets[index] += 1
  })
  return buckets
}

export function MetricLineChart({
  points,
  className,
  height = 180,
}: {
  points: MetricValue[]
  className?: string
  height?: number
}) {
  const width = 720
  const values = points.map((point) => point.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const range = Math.max(max - min, 1)
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
      const y = height - ((point.value - min) / range) * (height - 20) - 10
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80", className)}>
      {points.length === 0 ? (
        <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-slate-500">
          No metric data in selected range
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full min-h-[180px] w-full">
          <defs>
            <linearGradient id="metric-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1="0"
              x2={width}
              y1={(height / 4) * line + 10}
              y2={(height / 4) * line + 10}
              stroke="#1e293b"
              strokeDasharray="6 8"
            />
          ))}
          <path d={path} fill="none" stroke="url(#metric-line)" strokeLinecap="round" strokeWidth="4" />
          {points.map((point, index) => {
            const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
            const y = height - ((point.value - min) / range) * (height - 20) - 10
            return <circle key={`${point.timestamp}-${index}`} cx={x} cy={y} r="3" fill="#e2e8f0" opacity="0.85" />
          })}
        </svg>
      )}
    </div>
  )
}

export function SparkBars({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1)
  return (
    <div className={cn("flex h-14 items-end gap-1", className)}>
      {values.map((value, index) => (
        <div
          key={index}
          className="w-full rounded-t-sm bg-gradient-to-t from-cyan-500/40 via-violet-400/60 to-emerald-300"
          style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export function StatCard({
  icon,
  label,
  value,
  detail,
  tone = "cyan",
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  tone?: "cyan" | "emerald" | "amber" | "red" | "violet"
}) {
  const tones = {
    cyan: "from-cyan-500/20 text-cyan-200 border-cyan-400/20",
    emerald: "from-emerald-500/20 text-emerald-200 border-emerald-400/20",
    amber: "from-amber-500/20 text-amber-200 border-amber-400/20",
    red: "from-red-500/20 text-red-200 border-red-400/20",
    violet: "from-violet-500/20 text-violet-200 border-violet-400/20",
  }
  return (
    <Card className={cn("overflow-hidden border-slate-800 bg-slate-950/80 shadow-xl", tones[tone])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-50">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </div>
          <div className={cn("rounded-lg border bg-gradient-to-br to-transparent p-2", tones[tone])}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SeverityBadge({ level }: { level: string }) {
  return (
    <span className={cn("inline-flex min-w-14 items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", levelTone(level))}>
      {level}
    </span>
  )
}

export function DistributionBar({
  label,
  value,
  max,
  tone = "cyan",
}: {
  label: string
  value: number
  max: number
  tone?: "cyan" | "emerald" | "amber" | "red" | "violet"
}) {
  const tones = {
    cyan: "from-cyan-400 to-blue-500",
    emerald: "from-emerald-400 to-teal-500",
    amber: "from-amber-300 to-orange-500",
    red: "from-red-400 to-rose-600",
    violet: "from-violet-400 to-fuchsia-500",
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="truncate text-slate-300">{label}</span>
        <span className="font-mono text-slate-500">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-900">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", tones[tone])}
          style={{ width: `${Math.max(4, Math.min(100, (value / Math.max(max, 1)) * 100))}%` }}
        />
      </div>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
      <CircleDashed className="h-10 w-10 text-slate-600" />
      <h3 className="mt-4 text-sm font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  )
}

export const navItems = [
  { href: "/", label: "Live", icon: Activity },
  { href: "/search", label: "Explorer", icon: Terminal },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/settings", label: "Settings", icon: Settings },
]

export const systemBadges = [
  { label: "API", icon: ShieldCheck, value: "secured" },
  { label: "Store", icon: Database, value: "DuckDB" },
  { label: "Mode", icon: Zap, value: "self-hosted" },
]

export const insightCards = [
  { icon: <Gauge className="h-4 w-4" />, label: "Ingest SLO", value: "p99 <100ms", detail: "target from requirements", tone: "emerald" as const },
  { icon: <Server className="h-4 w-4" />, label: "Retention", value: "30d", detail: "default cleanup window", tone: "cyan" as const },
  { icon: <Info className="h-4 w-4" />, label: "Release", value: "v0.1 alpha", detail: "local observability stack", tone: "violet" as const },
  { icon: <CheckCircle2 className="h-4 w-4" />, label: "Ops posture", value: "ready", detail: "logs + metrics prepared", tone: "emerald" as const },
]

export function CopyButton({ value, onCopy }: { value: string; onCopy: (value: string) => void }) {
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-100" onClick={() => onCopy(value)} title="Copy">
      <Copy className="h-3.5 w-3.5" />
    </Button>
  )
}
