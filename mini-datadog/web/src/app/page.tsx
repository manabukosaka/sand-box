'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pause, Play, Trash2, Copy, Terminal, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogRecord {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

const getLogLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'info': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    case 'warn': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    case 'error': return 'text-red-400 border-red-400/30 bg-red-400/10';
    case 'debug': return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
  }
};

export default function LiveTail() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.service.toLowerCase().includes(filter.toLowerCase()) ||
    log.level.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const eventSource = new EventSource('/api/v1/stream/logs');

    eventSource.onopen = () => setStatus('connected');
    eventSource.onerror = () => {
      setStatus('error');
      toast.error("Failed to connect to log stream");
    };

    eventSource.onmessage = (event) => {
      try {
        const record: LogRecord = JSON.parse(event.data);
        setLogs((prev) => [...prev.slice(-199), record]); // 最大200件保持
      } catch (e) {
        console.error('Failed to parse log event', e);
      }
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (isAtBottom && !isAutoScroll) {
      setIsAutoScroll(true);
    } else if (!isAtBottom && isAutoScroll) {
      setIsAutoScroll(false);
    }
  }, [isAutoScroll]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
    });
  };

  const clearLogs = () => {
    setLogs([]);
    toast.info("Logs cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Live Tail</h2>
          <Badge 
            variant="outline" 
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-0.5 transition-colors",
              status === 'connected' ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : "text-destructive border-destructive/30 bg-destructive/10"
            )}
          >
            <span className={cn(
              "h-2 w-2 rounded-full",
              status === 'connected' ? "bg-emerald-400 animate-pulse" : "bg-destructive"
            )} />
            {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </Badge>
        </div>

        <div className="flex flex-1 max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Filter logs in memory..."
            className="pl-9 bg-slate-900 border-slate-800 focus-visible:ring-emerald-500/50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className="hidden sm:flex border-slate-800"
          >
            {isAutoScroll ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAutoScroll ? "Pause Scroll" : "Resume Scroll"}
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs} className="border-slate-800">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Card className="flex-1 relative overflow-hidden bg-slate-950 border-slate-800 shadow-2xl">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <Terminal className="h-8 w-8 animate-pulse-slow" />
              <p>{logs.length === 0 ? "Waiting for incoming logs..." : "No logs matching filter."}</p>
            </div>
          )}
          <div className="py-2">
            {filteredLogs.map((log, i) => (
              <div 
                key={i} 
                className="group flex items-start gap-4 px-4 py-1 hover:bg-slate-900/80 transition-colors border-l-2 border-transparent hover:border-slate-700"
                onClick={() => copyToClipboard(log.message)}
              >
                <span className="text-slate-500 whitespace-nowrap min-w-[160px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                  getLogLevelColor(log.level)
                )}>
                  {log.level}
                </span>
                <span className="text-emerald-500/80 font-medium whitespace-nowrap hidden md:inline">
                  [{log.service}]
                </span>
                <span className="text-slate-200 break-all flex-1">
                  {log.message}
                </span>
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded transition-all text-slate-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(log.message);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {!isAutoScroll && filteredLogs.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <Button 
              size="sm" 
              className="rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white animate-bounce"
              onClick={() => setIsAutoScroll(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Tail
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
