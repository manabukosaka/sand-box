'use client';

import { useEffect, useState, useRef } from 'react';

interface LogRecord {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

export default function LiveTail() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/v1/stream/logs');

    eventSource.onopen = () => setStatus('connected');
    eventSource.onerror = () => setStatus('error');

    eventSource.onmessage = (event) => {
      try {
        const record: LogRecord = JSON.parse(event.data);
        setLogs((prev) => [...prev.slice(-100), record]); // 最新100件を保持
      } catch (e) {
        console.error('Failed to parse log event', e);
      }
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Live Tail</h2>
        <span style={{ 
          fontSize: '0.8rem', 
          padding: '2px 8px', 
          borderRadius: '10px',
          background: status === 'connected' ? 'var(--secondary)' : 'var(--error)'
        }}>
          {status.toUpperCase()}
        </span>
        <button onClick={() => setLogs([])} style={{ marginLeft: 'auto', background: '#30363d' }}>Clear</button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="log-viewer" ref={scrollRef}>
          {logs.length === 0 && (
            <div style={{ color: '#8b949e', padding: '1rem' }}>Waiting for logs...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="log-entry">
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
              <span className={`log-level ${log.level.toLowerCase()}`}>{log.level.toUpperCase()}</span>
              <span className="log-service">{log.service}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
