'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, BellRing, PlayCircle, ShieldAlert, Workflow } from 'lucide-react'
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { DistributionBar, StatCard } from "@/components/observability/dashboard"

const initialRules = [
  { name: "Error burst", signal: "logs.error_rate", threshold: 15, window: "5m", channel: "Slack", enabled: true },
  { name: "CPU saturation", signal: "system.cpu.usage", threshold: 85, window: "10m", channel: "Webhook", enabled: true },
  { name: "Warning drift", signal: "logs.warn_count", threshold: 50, window: "15m", channel: "Email", enabled: false },
]

export default function AlertsPage() {
  const [rules, setRules] = useState(initialRules)
  const [name, setName] = useState("New incident rule")
  const [signal, setSignal] = useState("logs.error_rate")
  const [threshold, setThreshold] = useState(10)
  const [window, setWindow] = useState("5m")

  const enabled = useMemo(() => rules.filter((rule) => rule.enabled).length, [rules])

  const addRule = () => {
    setRules((current) => [{ name, signal, threshold, window, channel: "Preview", enabled: true }, ...current])
    toast.success("Preview rule added locally")
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard icon={<BellRing className="h-4 w-4" />} label="Rules" value={String(rules.length)} detail="frontend preview" tone="amber" />
        <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Enabled" value={String(enabled)} detail="local session only" tone="emerald" />
        <StatCard icon={<Workflow className="h-4 w-4" />} label="Channels" value="3" detail="Slack, email, webhook" tone="violet" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Persistence" value="off" detail="backend not implemented" tone="red" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="border-slate-800 bg-slate-950/75">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-50">Alert Studio</h1>
                <p className="mt-1 text-sm text-slate-500">Frontend-only rule builder for operational readiness.</p>
              </div>
              <Badge variant="outline" className="border-amber-400/30 bg-amber-500/10 text-amber-100">Preview</Badge>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} className="border-slate-800 bg-slate-900/70" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signal">Signal</Label>
                <SelectNative id="signal" value={signal} onChange={(event) => setSignal(event.target.value)} className="border-slate-800 bg-slate-900/70">
                  <option value="logs.error_rate">Log error rate</option>
                  <option value="logs.warn_count">Warn count</option>
                  <option value="system.cpu.usage">CPU usage</option>
                  <option value="system.memory.usage">Memory usage</option>
                </SelectNative>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input id="threshold" type="number" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="border-slate-800 bg-slate-900/70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="window">Window</Label>
                  <SelectNative id="window" value={window} onChange={(event) => setWindow(event.target.value)} className="border-slate-800 bg-slate-900/70">
                    <option value="5m">5m</option>
                    <option value="10m">10m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                  </SelectNative>
                </div>
              </div>
              <Button onClick={addRule} className="h-10 w-full bg-amber-300 text-slate-950 hover:bg-amber-200">
                <PlayCircle className="mr-2 h-4 w-4" />
                Add preview rule
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {rules.map((rule, index) => (
            <Card key={`${rule.name}-${index}`} className="border-slate-800 bg-slate-950/75">
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_220px_140px] lg:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={rule.enabled ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-slate-700 bg-slate-900 text-slate-400"}>
                      {rule.enabled ? "enabled" : "paused"}
                    </Badge>
                    <h2 className="font-semibold text-slate-50">{rule.name}</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{rule.signal} over {rule.window} to {rule.channel}</p>
                </div>
                <DistributionBar label={`threshold ${rule.threshold}`} value={rule.threshold} max={100} tone={rule.threshold > 80 ? "red" : "amber"} />
                <Button variant="outline" className="border-slate-800 bg-slate-900/60" onClick={() => setRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: !item.enabled } : item))}>
                  {rule.enabled ? "Pause" : "Enable"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
