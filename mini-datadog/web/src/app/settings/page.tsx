'use client'

import { useState } from 'react'
import { Database, KeyRound, Palette, Save, SlidersHorizontal } from 'lucide-react'
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { StatCard } from "@/components/observability/dashboard"

export default function SettingsPage() {
  const [retention, setRetention] = useState("30")
  const [density, setDensity] = useState("high")
  const [sampleRate, setSampleRate] = useState("100")

  const savePreview = () => {
    toast.info("Settings are preview-only in this frontend build")
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard icon={<Database className="h-4 w-4" />} label="Retention" value={`${retention}d`} detail="preview control" tone="cyan" />
        <StatCard icon={<Palette className="h-4 w-4" />} label="Density" value={density} detail="UI preference" tone="violet" />
        <StatCard icon={<SlidersHorizontal className="h-4 w-4" />} label="Sampling" value={`${sampleRate}%`} detail="not persisted" tone="emerald" />
        <StatCard icon={<KeyRound className="h-4 w-4" />} label="API key" value="test" detail="minidog-test-key" tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-slate-800 bg-slate-950/75">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-50">Operations Settings</h1>
                <p className="mt-1 text-sm text-slate-500">Preview configuration surface for the self-hosted stack.</p>
              </div>
              <Badge variant="outline" className="border-amber-400/30 bg-amber-500/10 text-amber-100">Frontend-only</Badge>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="api-key">Browser query API key</Label>
                <Input id="api-key" readOnly value="minidog-test-key" className="border-slate-800 bg-slate-900/70 font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention">Retention window</Label>
                <SelectNative id="retention" value={retention} onChange={(event) => setRetention(event.target.value)} className="border-slate-800 bg-slate-900/70">
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </SelectNative>
              </div>
              <div className="space-y-2">
                <Label htmlFor="density">Dashboard density</Label>
                <SelectNative id="density" value={density} onChange={(event) => setDensity(event.target.value)} className="border-slate-800 bg-slate-900/70">
                  <option value="high">High density</option>
                  <option value="balanced">Balanced</option>
                  <option value="calm">Calm</option>
                </SelectNative>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampling">Sampling percent</Label>
                <Input id="sampling" type="number" min="1" max="100" value={sampleRate} onChange={(event) => setSampleRate(event.target.value)} className="border-slate-800 bg-slate-900/70" />
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-slate-200">Persistence note</p>
              <p className="mt-1 text-sm text-slate-500">
                These controls document the intended operational surface. Backend persistence is intentionally out of scope for this UI-only enhancement.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-slate-800 bg-slate-950/75">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Apply preview</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Use this panel to validate the operational information architecture before wiring backend configuration endpoints.
            </p>
            <Button className="mt-5 h-10 w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300" onClick={savePreview}>
              <Save className="mr-2 h-4 w-4" />
              Save preview state
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
