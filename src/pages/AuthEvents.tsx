import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  Shield, Key, AlertTriangle, CheckCircle,
  RefreshCw, Lock, UserCheck, ShieldAlert
} from 'lucide-react';
import axios from 'axios';

export const AuthEvents: React.FC = () => {
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/security/auth-events');
      setAuthData(res.data);
    } catch (e: any) {
      console.error('Error fetching auth events', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to retrieve authentication telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthEvents();
  }, []);

  const isUnavailable = authData?.status === 'Unavailable on this system';
  const events = authData?.events || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Authentication & Logon Security Monitor
            </h1>
            <Tooltip content="Tracks logon sessions, failed logon spikes, and brute force credential attempts via OS-specific collectors." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            OS Security Event Log Parsing (Windows Event IDs 4624/4625, Linux auth.log, macOS utmpx)
          </p>
        </div>

        <button
          onClick={fetchAuthEvents}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Events
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={fetchAuthEvents}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {isUnavailable ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center space-y-3">
          <Lock className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Unavailable on this system</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Direct OS Security Event Log parsing requires administrative/elevated privileges on this platform or uses an unsupported authentication subsystem. Telemetry gracefully degrades without crashing.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">Recorded Logon Sessions & Auth Events</span>
            <span className="text-xs text-slate-500">Total: {events.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Account / User</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Logon Source</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading && !authData ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>Querying authentication telemetry...</span>
                      </div>
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No recent authentication events detected.
                    </td>
                  </tr>
                ) : (
                  events.map((e: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-400">{e.timestamp || 'Recent'}</td>
                      <td className="p-3 font-semibold text-slate-100">{e.username || e.user || 'SYSTEM'}</td>
                      <td className="p-3 font-mono text-blue-400">{e.event_type || 'Interactive'}</td>
                      <td className="p-3 text-slate-300">{e.source || 'Local Console'}</td>
                      <td className="p-3">
                        {e.status === 'failed' || e.success === false ? (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        ) : (
                          <span className="text-green-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Success
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
