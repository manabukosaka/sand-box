'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectNative } from "@/components/ui/select-native";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Calendar, Filter, Terminal, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogRecord {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

const getLogLevelVariant = (level: string) => {
  switch (level.toLowerCase()) {
    case 'info': return 'outline';
    case 'warn': return 'warning'; // Custom logic or just style
    case 'error': return 'destructive';
    default: return 'secondary';
  }
};

const getLogLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'info': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    case 'warn': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    case 'error': return 'text-red-400 border-red-400/30 bg-red-400/10';
    case 'debug': return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
  }
};

export default function LogSearch() {
  const [start, setStart] = useState(new Date(Date.now() - 3600000).toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [results, setResults] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const setQuickRange = (minutes: number) => {
    const now = new Date();
    const past = new Date(now.getTime() - minutes * 60000);
    
    // adjust for local time used by datetime-local input
    const offset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - offset);
    const localPast = new Date(past.getTime() - offset);
    
    setEnd(localNow.toISOString().slice(0, 16));
    setStart(localPast.toISOString().slice(0, 16));
    toast.info(`Time range set to last ${minutes >= 60 ? minutes / 60 + 'h' : minutes + 'm'}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/query/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'minidog-test-key'
        },
        body: JSON.stringify({
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          query: query || undefined,
          level: level || undefined,
          limit: 100
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.hits || []);
      toast.success(`Found ${data.hits?.length || 0} logs`);
    } catch (error) {
      console.error('Search failed', error);
      toast.error("Search failed. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied message to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Logs Search</h2>
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
          <Button variant="ghost" size="sm" onClick={() => setQuickRange(15)} className="text-xs h-8 hover:bg-slate-800">Last 15m</Button>
          <Button variant="ghost" size="sm" onClick={() => setQuickRange(60)} className="text-xs h-8 hover:bg-slate-800">Last 1h</Button>
          <Button variant="ghost" size="sm" onClick={() => setQuickRange(1440)} className="text-xs h-8 hover:bg-slate-800">Last 24h</Button>
        </div>
      </div>
      
      <Card className="border-slate-800 bg-slate-900/50 shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500/50 via-sky-500/50 to-indigo-500/50" />
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start" className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5" /> Start Time
              </Label>
              <Input 
                id="start"
                type="datetime-local" 
                value={start} 
                onChange={(e) => setStart(e.target.value)}
                className="bg-slate-950 border-slate-800 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5" /> End Time
              </Label>
              <Input 
                id="end"
                type="datetime-local" 
                value={end} 
                onChange={(e) => setEnd(e.target.value)}
                className="bg-slate-950 border-slate-800 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level" className="flex items-center gap-2 text-slate-400">
                <Filter className="h-3.5 w-3.5" /> Level
              </Label>
              <SelectNative 
                id="level"
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="bg-slate-950 border-slate-800 focus:ring-emerald-500/30 transition-all"
              >
                <option value="">ALL LEVELS</option>
                <option value="info">INFO</option>
                <option value="warn">WARN</option>
                <option value="error">ERROR</option>
                <option value="debug">DEBUG</option>
              </SelectNative>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="query" className="flex items-center gap-2 text-slate-400">
                <Search className="h-3.5 w-3.5" /> Keyword
              </Label>
              <Input 
                id="query"
                type="text" 
                placeholder="e.g. error, auth..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                className="bg-slate-950 border-slate-800 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Logs
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-800 bg-slate-900/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/10">
            <Terminal className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No results found. Adjust your filters and try again.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Results ({results.length})</span>
            </div>
            {results.map((log, i) => (
              <Card key={i} className="group border-slate-800 bg-slate-950 hover:bg-slate-900 transition-all shadow-sm overflow-hidden border-l-2 border-l-transparent hover:border-l-emerald-500">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-1.5 border-b border-slate-800/50 bg-slate-900/20">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2 ml-auto sm:ml-4">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        getLogLevelColor(log.level)
                      )}>
                        {log.level}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-800 text-slate-300 border-slate-700">
                        {log.service}
                      </Badge>
                      <button 
                        onClick={() => copyToClipboard(log.message)}
                        className="ml-2 p-1 hover:bg-slate-700 rounded transition-colors text-slate-500 opacity-0 group-hover:opacity-100"
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 font-mono text-[13px] text-slate-200 break-all leading-relaxed">
                    {log.message}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
