'use client';

import { useState } from 'react';

interface LogRecord {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

export default function LogSearch() {
  const [start, setStart] = useState(new Date(Date.now() - 3600000).toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [results, setResults] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/query/logs', {
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
    } catch (error) {
      console.error('Search failed', error);
      alert('Search failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Logs Search</h2>
      </div>
      
      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#8b949e' }}>Start Time</label>
            <input 
              type="datetime-local" 
              value={start} 
              onChange={(e) => setStart(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#0d1117', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#8b949e' }}>End Time</label>
            <input 
              type="datetime-local" 
              value={end} 
              onChange={(e) => setEnd(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#0d1117', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#8b949e' }}>Level</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#0d1117', color: 'white' }}
            >
              <option value="">ALL LEVELS</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
              <option value="debug">DEBUG</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#8b949e' }}>Keyword Search</label>
            <input 
              type="text" 
              placeholder="e.g. database, connection" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#0d1117', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading} style={{ width: '100%', height: '38px' }}>
              {loading ? 'Searching...' : 'Search Logs'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="log-viewer" style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}>
          {results.length === 0 && !loading && (
            <div style={{ color: '#8b949e', padding: '1rem' }}>No results found. Adjust your filters and try again.</div>
          )}
          {results.map((log, i) => (
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
