import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  Network, Search, ShieldCheck, ShieldAlert,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Globe, Server, Activity
} from 'lucide-react';
import axios from 'axios';

export const NetworkMonitor: React.FC = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ upload_rate: 0, download_rate: 0, connection_count: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkData = async (isManual = false) => {
    try {
      if (isManual || connections.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      const [resConns, resStats] = await Promise.allSettled([
        axios.get('/api/network/connections'),
        axios.get('/api/network/stats')
      ]);

      if (resConns.status === 'fulfilled' && Array.isArray(resConns.value.data)) {
        setConnections(resConns.value.data);
      }
      if (resStats.status === 'fulfilled' && resStats.value.data) {
        setStats(resStats.value.data);
      }
    } catch (e: any) {
      console.error('Error fetching network data', e);
      if (connections.length === 0) {
        setError(e?.response?.data?.detail || e.message || 'Failed to fetch network socket telemetry');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(() => fetchNetworkData(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = connections.filter((c) => {
    const conn = c.connection || c;
    const ip = (conn.remote_address || conn.remote_ip || '').toString();
    const port = (conn.remote_port || '').toString();
    const proc = (conn.process_name || '').toString().toLowerCase();
    const laddr = (conn.local_address || '').toString();
    const q = search.toLowerCase();
    return ip.includes(q) || port.includes(q) || proc.includes(q) || laddr.includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-6 h-6 text-blue-400" />
              Network Connection & Socket Analysis
            </h1>
            <Tooltip content="Live socket inspection. An unfamiliar remote IP or port is never flagged as malware solely because it is unfamiliar." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking {connections.length} active sockets, transmission throughput, and threat intelligence correlation
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by IP, Port, or Process..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => fetchNetworkData(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={() => fetchNetworkData(true)}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Upload Rate</span>
            <div className="text-lg font-bold text-blue-400 mt-1">
              {((stats.upload_rate || stats.net_upload_rate || 0) / 1024).toFixed(1)} KB/s
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Download Rate</span>
            <div className="text-lg font-bold text-indigo-400 mt-1">
              {((stats.download_rate || stats.net_download_rate || 0) / 1024).toFixed(1)} KB/s
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Sockets</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {stats.connection_count || stats.net_connections_count || connections.length}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Network Connections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Protocol</th>
                <th className="p-3">Local Address</th>
                <th className="p-3">Remote Destination</th>
                <th className="p-3">Process / PID</th>
                <th className="p-3">Socket State</th>
                <th className="p-3">Threat Intel Reputation</th>
                <th className="p-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && connections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Loading active network sockets...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No active connections matching current filter.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((item, idx) => {
                  const conn = item.connection || item;
                  const isNew = item.is_new_ip;
                  const riskScore = item.risk_score || item.anomaly_score || 0;
                  const isSuspicious = item.is_suspicious || riskScore > 0.25;

                  return (
                    <tr key={idx} className={`hover:bg-slate-800/40 transition ${isSuspicious ? 'bg-amber-950/20' : ''}`}>
                      <td className="p-3 font-mono font-bold text-blue-400 uppercase">
                        {conn.protocol || 'TCP'}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {conn.local_address}:{conn.local_port}
                      </td>
                      <td className="p-3 font-mono text-slate-200">
                        {conn.remote_address && conn.remote_address !== '*' ? `${conn.remote_address}:${conn.remote_port}` : 'Listening / Any'}
                      </td>
                      <td className="p-3 text-slate-300 font-semibold">
                        {conn.process_name || 'System'} {conn.pid ? `(${conn.pid})` : ''}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {conn.status || 'NONE'}
                        </span>
                      </td>
                      <td className="p-3">
                        {isNew ? (
                          <span className="text-cyan-400 flex items-center gap-1 text-[11px]">
                            <Globe className="w-3 h-3" /> New Endpoint
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-green-400/80" /> Verified
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isSuspicious ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" /> Elevated ({(riskScore * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
