import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  Clock, ShieldAlert, Zap, Cpu, Network,
  RefreshCw, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import axios from 'axios';

export const SecurityTimeline: React.FC = () => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/security/timeline');
      if (Array.isArray(res.data)) {
        setTimeline(res.data);
      }
    } catch (e: any) {
      console.error('Error fetching timeline', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to retrieve security timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Security Incident & Telemetry Timeline
            </h1>
            <Tooltip content="Chronological sequence of security anomalies, ML inferences, and baseline adaptations." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Backwards incident forensics with correlated evidence tracing
          </p>
        </div>

        <button
          onClick={fetchTimeline}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Timeline
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={fetchTimeline}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        {loading && timeline.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Loading chronological security timeline...</span>
          </div>
        ) : timeline.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Security Timeline Events Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Real behavioral anomalies, heuristic triggers, and active simulations will be automatically logged and displayed here.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
            {timeline.map((event, idx) => {
              const isHigh = event.severity === 'High' || event.severity === 'Critical';
              const timeStr = event.timestamp
                ? new Date(event.timestamp).toLocaleString()
                : 'Recent';

              return (
                <div key={idx} className="relative pl-6">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 ${
                      isHigh ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  />

                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {event.title}
                        {event.is_simulation && (
                          <span className="text-[10px] uppercase font-bold bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800">
                            Simulation
                          </span>
                        )}
                      </h3>
                      <span className="font-mono text-xs text-slate-400">{timeStr}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {event.description}
                    </p>

                    {event.evidence && (
                      <div className="mt-2 text-[11px] font-mono bg-slate-950 p-2 rounded text-slate-400 border border-slate-800">
                        Evidence: {typeof event.evidence === 'string' ? event.evidence : JSON.stringify(event.evidence)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
