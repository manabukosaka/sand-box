'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Calendar, Copy, Filter, Fingerprint, Search, Tags, Terminal } from 'lucide-react'
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DistributionBar,
  EmptyState,
  LogRecord,
  SeverityBadge,
  SparkBars,
  StatCard,
  formatDateTime,
  formatNumber,
  levelOrder,
  summarizeLogs,
  timelineBuckets,
} from "@/components/observability/dashboard"

interface LogQueryResponse {
  total: number
  hits: LogRecord[]
}

interface FacetCount {
  key: string
  value: string
  count: number
}

function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function collectFacets(logs: LogRecord[]) {
  return collectFacetCounts(logs).slice(0, 12)
}

function collectFacetCounts(logs: LogRecord[]) {
  const counts = new Map<string, number>()
  logs.forEach((log) => {
    counts.set(`service:${log.service || "unknown"}`, (counts.get(`service:${log.service || "unknown"}`) ?? 0) + 1)
    counts.set(`level:${log.level || "unknown"}`, (counts.get(`level:${log.level || "unknown"}`) ?? 0) + 1)

    ;([
      ["tag", log.tags],
      ["attr", log.attributes],
    ] as const).forEach(([scope, values]) => {
      if (!values || typeof values !== "object") return
      Object.entries(values as Record<string, unknown>).forEach(([key, value]) => {
        if (value === null || value === undefined || typeof value === "object") return
        const facet = `${scope}.${key}:${String(value)}`
        counts.set(facet, (counts.get(facet) ?? 0) + 1)
      })
    })
  })

  return Array.from(counts.entries())
    .map(([facet, count]) => {
      const separator = facet.indexOf(":")
      return {
        key: facet.slice(0, separator),
        value: facet.slice(separator + 1),
        count,
      }
    })
    .sort((a, b) => b.count - a.count || `${a.key}:${a.value}`.localeCompare(`${b.key}:${b.value}`))
}

function collectCorrelationFields(logs: LogRecord[]) {
  const correlationKeys = ["trace_id", "traceId", "span_id", "spanId", "request_id", "requestId", "correlation_id", "correlationId"]
  return collectFacetCounts(logs)
    .filter((facet) => correlationKeys.some((key) => facet.key.toLowerCase().endsWith(key.toLowerCase())))
    .slice(0, 8)
}

export default function LogSearch() {
  const [start, setStart] = useState(toLocalInput(new Date(Date.now() - 3600000)))
  const [end, setEnd] = useState(toLocalInput(new Date()))
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('')
  const [limit, setLimit] = useState(100)
  const [results, setResults] = useState<LogRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const summary = useMemo(() => summarizeLogs(results), [results])
  const buckets = useMemo(() => timelineBuckets(results, 32), [results])
  const facets = useMemo(() => collectFacets(results), [results])
  const correlationFields = useMemo(() => collectCorrelationFields(results), [results])
  const maxService = Math.max(...summary.topServices.map(([, count]) => count), 1)
  const maxFacetCount = Math.max(...facets.map((facet) => facet.count), 1)

  const setQuickRange = (minutes: number) => {
    const now = new Date()
    const past = new Date(now.getTime() - minutes * 60000)
    setEnd(toLocalInput(now))
    setStart(toLocalInput(past))
    toast.info(`Range set to last ${minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}`)
  }

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/v1/query/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'minidog-test-key',
        },
        body: JSON.stringify({
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          query: query || undefined,
          level: level || undefined,
          limit,
        }),
      })
      if (!response.ok) throw new Error(response.statusText)
      const data: LogQueryResponse = await response.json()
      setResults(data.hits || [])
      setTotal(data.total || data.hits?.length || 0)
      toast.success(`Loaded ${data.hits?.length || 0} log records`)
    } catch (error) {
      console.error('Search failed', error)
      toast.error("Search failed. Check backend connectivity.")
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setLevel('')
    setLimit(100)
    setQuickRange(60)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied message")
  }

  const applyFacet = (facet: FacetCount) => {
    if (facet.key === "level") {
      setLevel(facet.value.toLowerCase())
    } else {
      setQuery(facet.value)
    }
    toast.info(`Facet applied: ${facet.key}:${facet.value}`)
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard icon={<Search className="h-4 w-4" />} label="Query hits" value={formatNumber(results.length)} detail={`${formatNumber(total)} reported by API`} tone="cyan" />
        <StatCard icon={<Terminal className="h-4 w-4" />} label="Services" value={formatNumber(summary.services)} detail="represented in result set" tone="violet" />
        <StatCard icon={<Filter className="h-4 w-4" />} label="Errors" value={formatNumber(summary.errors)} detail={`${summary.errorRate}% of loaded hits`} tone={summary.errors ? "red" : "emerald"} />
        <StatCard icon={<Tags className="h-4 w-4" />} label="Facets" value={formatNumber(facets.length)} detail="from loaded tags and attributes" tone="emerald" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit border-slate-800 bg-slate-950/75 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-50">Log Explorer</h1>
                <p className="mt-1 text-sm text-slate-500">Troubleshoot incidents with dense filters and result analytics.</p>
              </div>
              <Badge variant="outline" className="border-cyan-400/30 bg-cyan-500/10 text-cyan-100">Query API</Badge>
            </div>

            <form onSubmit={handleSearch} className="mt-6 space-y-5">
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" size="sm" className="border-slate-800 bg-slate-900/60" onClick={() => setQuickRange(15)}>15m</Button>
                <Button type="button" variant="outline" size="sm" className="border-slate-800 bg-slate-900/60" onClick={() => setQuickRange(60)}>1h</Button>
                <Button type="button" variant="outline" size="sm" className="border-slate-800 bg-slate-900/60" onClick={() => setQuickRange(1440)}>24h</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start" className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                  Start
                </Label>
                <Input id="start" type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className="border-slate-800 bg-slate-900/70" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end" className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                  End
                </Label>
                <Input id="end" type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} className="border-slate-800 bg-slate-900/70" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="query">Keyword or service</Label>
                <Input id="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="error, payment-api, timeout..." className="border-slate-800 bg-slate-900/70" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <SelectNative id="level" value={level} onChange={(event) => setLevel(event.target.value)} className="border-slate-800 bg-slate-900/70">
                    <option value="">All</option>
                    {levelOrder.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
                  </SelectNative>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Limit</Label>
                  <SelectNative id="limit" value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="border-slate-800 bg-slate-900/70">
                    {[50, 100, 250, 500].map((item) => <option key={item} value={item}>{item}</option>)}
                  </SelectNative>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading} className="h-10 flex-1 bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  {loading ? "Searching..." : "Run query"}
                </Button>
                <Button type="button" variant="outline" className="h-10 border-slate-800 bg-slate-900/60" onClick={clearFilters}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-950/75">
            <CardContent className="p-5">
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Result timeline</p>
                    <span className="text-xs text-slate-500">{results.length} loaded records</span>
                  </div>
                  <SparkBars values={buckets} className="mt-5 h-24" />
                </div>
                <div className="space-y-3">
                  {levelOrder.map((item) => (
                    <DistributionBar key={item} label={item.toUpperCase()} value={summary.byLevel[item] ?? 0} max={Math.max(summary.total, 1)} tone={item === "error" ? "red" : item === "warn" ? "amber" : item === "debug" ? "violet" : "cyan"} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1fr_300px]">
            <Card className="overflow-hidden border-slate-800 bg-slate-950/75">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search results</span>
                  <Badge variant="outline" className="border-slate-700 bg-slate-950 text-slate-300">{results.length} rows</Badge>
                </div>
                {loading ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 bg-slate-900" />)}
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4">
                    <EmptyState title="No query results" description="Run a query against /api/v1/query/logs to populate this analysis surface." />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-900">
                    {results.map((log, index) => (
                      <div key={`${log.timestamp}-${index}`} className="grid gap-2 px-4 py-3 hover:bg-slate-900/60 md:grid-cols-[170px_70px_150px_1fr_32px] md:items-start">
                        <span className="text-xs text-slate-500">{formatDateTime(log.timestamp)}</span>
                        <SeverityBadge level={log.level} />
                        <span className="truncate text-sm text-cyan-200">{log.service}</span>
                        <p className="break-all font-mono text-[13px] leading-5 text-slate-200">{log.message}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-100" onClick={() => copyToClipboard(log.message)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <aside className="space-y-4">
              <Card className="border-slate-800 bg-slate-950/75">
                <CardContent className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top services</p>
                  <div className="mt-4 space-y-3">
                    {summary.topServices.length === 0 ? (
                      <p className="text-sm text-slate-500">No services in result set.</p>
                    ) : (
                      summary.topServices.map(([name, count]) => <DistributionBar key={name} label={name} value={count} max={maxService} tone="emerald" />)
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-950/75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Facets</p>
                    <Badge variant="outline" className="border-slate-700 bg-slate-950 text-[10px] text-slate-400">click to filter</Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {facets.length === 0 ? (
                      <p className="text-sm text-slate-500">Run a query to extract service, level, tag, and attribute facets.</p>
                    ) : (
                      facets.map((facet) => (
                        <button
                          key={`${facet.key}:${facet.value}`}
                          type="button"
                          className="w-full rounded-md border border-slate-800 bg-slate-900/40 p-2 text-left transition-colors hover:border-cyan-400/30 hover:bg-slate-900"
                          onClick={() => applyFacet(facet)}
                        >
                          <DistributionBar label={`${facet.key}:${facet.value}`} value={facet.count} max={maxFacetCount} tone={facet.key === "level" ? "violet" : "cyan"} />
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-950/75">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-emerald-300" />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Correlation IDs</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {correlationFields.length === 0 ? (
                      <p className="text-sm leading-5 text-slate-500">No trace, span, request, or correlation IDs found in loaded tags or attributes.</p>
                    ) : (
                      correlationFields.map((facet) => (
                        <Button
                          key={`${facet.key}:${facet.value}`}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start border-slate-800 bg-slate-900/60 font-mono text-xs"
                          onClick={() => applyFacet(facet)}
                        >
                          {facet.key}:{facet.value}
                        </Button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-950/75">
                <CardContent className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Query presets</p>
                  <div className="mt-4 grid gap-2">
                    {["timeout", "error", "auth", "payment"].map((preset) => (
                      <Button key={preset} variant="outline" size="sm" className="justify-start border-slate-800 bg-slate-900/60" onClick={() => setQuery(preset)}>
                        {preset}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </section>
    </div>
  )
}
