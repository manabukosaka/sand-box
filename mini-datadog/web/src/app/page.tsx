'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Copy, Pause, Play, Search, Server, Terminal, Trash2, Wifi, WifiOff } from 'lucide-react'
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  CopyButton,
  DistributionBar,
  EmptyState,
  LogRecord,
  SeverityBadge,
  SparkBars,
  StatCard,
  formatNumber,
  formatTime,
  levelOrder,
  summarizeLogs,
  timelineBuckets,
} from "@/components/observability/dashboard"
import { cn } from "@/lib/utils"

export default function LiveTail() {
  const [logs, setLogs] = useState<LogRecord[]>([])
  const [filter, setFilter] = useState('')
  const [level, setLevel] = useState('all')
  const [service, setService] = useState('all')
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/v1/stream/logs')
    eventSource.onopen = () => setStatus('connected')
    eventSource.onerror = () => {
      setStatus('error')
      toast.error("Log stream disconnected")
    }
    eventSource.onmessage = (event) => {
      try {
        const record: LogRecord = JSON.parse(event.data)
        setLogs((prev) => [...prev.slice(-299), record])
      } catch (error) {
        console.error('Failed to parse log event', error)
      }
    }
    return () => eventSource.close()
  }, [])

  const services = useMemo(() => Array.from(new Set(logs.map((log) => log.service).filter(Boolean))).sort(), [logs])
  const filteredLogs = useMemo(() => {
    const query = filter.trim().toLowerCase()
    return logs.filter((log) => {
      const matchesQuery =
        !query ||
        log.message.toLowerCase().includes(query) ||
        log.service.toLowerCase().includes(query) ||
        log.level.toLowerCase().includes(query)
      const matchesLevel = level === 'all' || log.level.toLowerCase() === level
      const matchesService = service === 'all' || log.service === service
      return matchesQuery && matchesLevel && matchesService
    })
  }, [filter, level, logs, service])

  const summary = useMemo(() => summarizeLogs(logs), [logs])
  const filteredSummary = useMemo(() => summarizeLogs(filteredLogs), [filteredLogs])
  const buckets = useMemo(() => timelineBuckets(filteredLogs), [filteredLogs])
  const maxService = Math.max(...summary.topServices.map(([, count]) => count), 1)

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredLogs, isAutoScroll])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60
    setIsAutoScroll(isAtBottom)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied log message")
  }

  const clearLogs = () => {
    setLogs([])
    toast.info("Live buffer cleared")
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="border-b border-slate-800 p-5 lg:border-b-0 lg:border-r">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-2">
                    <Terminal className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-50">Live Operations Tail</h1>
                    <p className="mt-1 text-sm text-slate-400">Realtime log stream with service and severity intelligence.</p>
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "w-fit gap-2 px-3 py-1 text-xs uppercase tracking-wider",
                  status === 'connected'
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/30 bg-red-500/10 text-red-200"
                )}
              >
                {status === 'connected' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {status}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={<Terminal className="h-4 w-4" />} label="Buffered logs" value={formatNumber(summary.total)} detail="last 300 events" tone="cyan" />
              <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Error rate" value={`${summary.errorRate}%`} detail={`${summary.errors} errors observed`} tone={summary.errors > 0 ? "red" : "emerald"} />
              <StatCard icon={<Server className="h-4 w-4" />} label="Services" value={formatNumber(summary.services)} detail="active producers" tone="violet" />
              <StatCard icon={<Wifi className="h-4 w-4" />} label="Filtered view" value={formatNumber(filteredSummary.total)} detail="matching current scope" tone="emerald" />
            </div>
          </div>
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Event pressure</p>
            <SparkBars values={buckets} className="mt-4" />
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {levelOrder.map((item) => (
                <div key={item} className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{item}</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-slate-100">{filteredSummary.byLevel[item] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden border-slate-800 bg-slate-950/70 shadow-xl">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/40 p-4 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter message, level, service..." className="h-10 border-slate-800 bg-slate-950/70 pl-9" />
              </div>
              <select value={level} onChange={(event) => setLevel(event.target.value)} className="h-10 rounded-md border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100">
                <option value="all">All levels</option>
                {levelOrder.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
              </select>
              <select value={service} onChange={(event) => setService(event.target.value)} className="h-10 rounded-md border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100">
                <option value="all">All services</option>
                {services.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAutoScroll((value) => !value)} className="h-10 border-slate-800 bg-slate-950/70">
                  {isAutoScroll ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isAutoScroll ? "Pause" : "Resume"}
                </Button>
                <Button variant="outline" size="sm" onClick={clearLogs} className="h-10 border-slate-800 bg-slate-950/70">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <div ref={scrollRef} onScroll={handleScroll} className="h-[calc(100vh-25rem)] min-h-[460px] overflow-y-auto font-mono text-[12px]">
              {filteredLogs.length === 0 ? (
                <EmptyState title={logs.length === 0 ? "Waiting for stream data" : "No logs match current filters"} description="Ingest logs into /api/v1/ingest/logs or relax the filters to populate the operational feed." />
              ) : (
                <div className="divide-y divide-slate-900">
                  {filteredLogs.map((log, index) => (
                    <div key={`${log.timestamp}-${index}`} className="group grid grid-cols-[88px_68px_minmax(96px,140px)_1fr_32px] items-start gap-3 px-4 py-2 hover:bg-slate-900/70">
                      <span className="whitespace-nowrap text-slate-500">{formatTime(log.timestamp)}</span>
                      <SeverityBadge level={log.level} />
                      <span className="truncate text-cyan-200/80">{log.service}</span>
                      <span className="break-all leading-5 text-slate-200">{log.message}</span>
                      <CopyButton value={log.message} onCopy={copyToClipboard} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-slate-800 bg-slate-950/70">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Service share</p>
              <div className="mt-4 space-y-3">
                {summary.topServices.length === 0 ? (
                  <p className="text-sm text-slate-500">No active services yet.</p>
                ) : (
                  summary.topServices.map(([name, count], index) => (
                    <DistributionBar key={name} label={name} value={count} max={maxService} tone={index === 0 ? "emerald" : "cyan"} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-950/70">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Incident radar</p>
              <div className="mt-4 space-y-3">
                {logs.slice(-5).reverse().map((log, index) => (
                  <div key={`${log.timestamp}-${index}`} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge level={log.level} />
                      <span className="text-[11px] text-slate-500">{formatTime(log.timestamp)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{log.message}</p>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-sm text-slate-500">Recent critical signals will appear here.</p>}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
