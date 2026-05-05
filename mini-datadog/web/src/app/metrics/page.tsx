'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Activity, BarChart3, Gauge, Server, TrendingUp } from 'lucide-react'
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { EmptyState, MetricLineChart, MetricValue, StatCard, formatNumber } from "@/components/observability/dashboard"

interface MetricQueryResponse {
  metric_name: string
  results: MetricValue[]
}

function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function MetricsPage() {
  const [metricName, setMetricName] = useState('system.cpu.usage')
  const [service, setService] = useState('')
  const [interval, setInterval] = useState('1m')
  const [start, setStart] = useState(toLocalInput(new Date(Date.now() - 3600000)))
  const [end, setEnd] = useState(toLocalInput(new Date()))
  const [points, setPoints] = useState<MetricValue[]>([])
  const [loading, setLoading] = useState(false)

  const stats = useMemo(() => {
    const values = points.map((point) => point.value)
    const latest = values.at(-1) ?? 0
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    const max = values.length ? Math.max(...values) : 0
    const min = values.length ? Math.min(...values) : 0
    return { latest, average, max, min }
  }, [points])

  const setQuickRange = (minutes: number) => {
    const now = new Date()
    const past = new Date(now.getTime() - minutes * 60000)
    setEnd(toLocalInput(now))
    setStart(toLocalInput(past))
  }

  const handleQuery = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/v1/query/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'minidog-test-key',
        },
        body: JSON.stringify({
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          metric_name: metricName,
          service: service || undefined,
          interval,
        }),
      })
      if (!response.ok) throw new Error(response.statusText)
      const data: MetricQueryResponse = await response.json()
      setPoints(data.results || [])
      toast.success(`Loaded ${data.results?.length || 0} metric points`)
    } catch (error) {
      console.error('Metric query failed', error)
      toast.error("Metric query failed. Check metric ingestion and backend connectivity.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard icon={<Activity className="h-4 w-4" />} label="Latest" value={formatNumber(stats.latest)} detail={metricName} tone="cyan" />
        <StatCard icon={<Gauge className="h-4 w-4" />} label="Average" value={formatNumber(stats.average)} detail={`${points.length} points`} tone="emerald" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Max" value={formatNumber(stats.max)} detail={`min ${formatNumber(stats.min)}`} tone="violet" />
        <StatCard icon={<Server className="h-4 w-4" />} label="Service" value={service || "all"} detail={`interval ${interval}`} tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit border-slate-800 bg-slate-950/75">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-50">Metrics Control</h1>
                <p className="mt-1 text-sm text-slate-500">Query time-series data from DuckDB and inspect operational shape.</p>
              </div>
              <Badge variant="outline" className="border-violet-400/30 bg-violet-500/10 text-violet-100">Metrics API</Badge>
            </div>
            <form onSubmit={handleQuery} className="mt-6 space-y-5">
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" size="sm" className="border-slate-800 bg-slate-900/60" onClick={() => setQuickRange(15)}>15m</Button>
                <Button type="button" variant="outline" size="sm" className="border-slate-800 bg-slate-900/60" onClick={() => setQuickRange(60)}>1h</Button>
                <Button type="button" variant="outline" size="sm" className="border-slate-800 bg-slate-900/60" onClick={() => setQuickRange(1440)}>24h</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric">Metric name</Label>
                <Input id="metric" value={metricName} onChange={(event) => setMetricName(event.target.value)} className="border-slate-800 bg-slate-900/70" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service filter</Label>
                <Input id="service" value={service} onChange={(event) => setService(event.target.value)} placeholder="optional" className="border-slate-800 bg-slate-900/70" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start">Start</Label>
                  <Input id="start" type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className="border-slate-800 bg-slate-900/70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End</Label>
                  <Input id="end" type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} className="border-slate-800 bg-slate-900/70" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Interval</Label>
                <SelectNative id="interval" value={interval} onChange={(event) => setInterval(event.target.value)} className="border-slate-800 bg-slate-900/70">
                  <option value="1m">1 minute</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="1h">1 hour</option>
                </SelectNative>
              </div>
              <Button type="submit" disabled={loading} className="h-10 w-full bg-violet-400 text-slate-950 hover:bg-violet-300">
                {loading ? "Querying..." : "Run metric query"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-950/75">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-50">Signal trajectory</h2>
                  <p className="text-sm text-slate-500">SVG chart, no external chart dependency.</p>
                </div>
                <BarChart3 className="h-5 w-5 text-violet-200" />
              </div>
              <MetricLineChart points={points} className="h-[360px]" height={240} />
            </CardContent>
          </Card>
          {points.length === 0 && (
            <EmptyState title="No metric points loaded" description="Ingest metrics via /api/v1/ingest/metrics, then query a metric name and interval to populate this dashboard." />
          )}
        </div>
      </section>
    </div>
  )
}
