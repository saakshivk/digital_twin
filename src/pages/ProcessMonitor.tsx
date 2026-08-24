import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity, Search, ShieldAlert, Cpu, HardDrive,
  RefreshCw, Terminal, Eye, X, CornerDownRight, ShieldCheck, User
} from 'lucide-react';
import axios from 'axios';

export const ProcessMonitor: React.FC = () => {
  const [processes, setProcesses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProc, setSelectedProc] = useState<any>(null);
  const [procDetail, setProcDetail] = useState<any>(null);

  const fetchProcesses = async (isManual = false) => {
    try {
      if (isManual || processes.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      const res = await axios.get('/api/processes');
      if (Array.isArray(res.data)) {
        setProcesses(res.data);
      }
    } catch (e: any) {
      console.error('Error fetching processes', e);
      if (processes.length === 0) {
        setError(e?.response?.data?.detail || e.message || 'Failed to fetch process telemetry');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(() => fetchProcesses(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectProcess = async (proc: any) => {
    setSelectedProc(proc);
    try {
      const res = await axios.get(`/api/processes/${proc.pid}`);
      setProcDetail(res.data);
    } catch (e) {
      setProcDetail({ process: proc, tree: {}, risk: { score: proc.anomaly_score, explanation: proc.risk_explanation } });
    }
  };

  const filtered = processes.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.pid || '').toString().includes(search) ||
    (p.username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              Process & Execution Monitor
            </h1>
            <Tooltip content="Live monitoring of active operating system processes with heuristic and anomaly scoring. Unfamiliar processes are never labeled malware automatically." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking {processes.length} active host processes, resource allocation, and parent-child hierarchies
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by PID, Name, or User..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => fetchProcesses(true)}
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
            onClick={() => fetchProcesses(true)}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Process Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">PID</th>
                <th className="p-3">Process Name</th>
                <th className="p-3">Parent Process</th>
                <th className="p-3">CPU %</th>
                <th className="p-3">RAM %</th>
                <th className="p-3">RSS Memory</th>
                <th className="p-3">Account</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && processes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Loading active system processes...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No active processes matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((proc) => {
                  const isSuspicious = proc.is_suspicious || (proc.anomaly_score > 0.35);
                  return (
                    <tr
                      key={proc.pid}
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        isSuspicious ? 'bg-amber-950/20' : ''
                      }`}
                      onClick={() => handleSelectProcess(proc)}
                    >
                      <td className="p-3 font-mono font-bold text-slate-400">{proc.pid}</td>
                      <td className="p-3 font-semibold text-slate-100 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        {proc.name}
                      </td>
                      <td className="p-3 text-slate-400">
                        {proc.parent_name || (proc.ppid ? `PID ${proc.ppid}` : 'None')}
                      </td>
                      <td className="p-3 font-mono text-blue-400">
                        {typeof proc.cpu_percent === 'number' ? proc.cpu_percent.toFixed(1) : 0}%
                      </td>
                      <td className="p-3 font-mono text-indigo-400">
                        {typeof proc.memory_percent === 'number' ? proc.memory_percent.toFixed(1) : 0}%
                      </td>
                      <td className="p-3 text-slate-400">
                        {((proc.memory_rss || 0) / (1024 * 1024)).toFixed(1)} MB
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-[120px]">
                        {proc.username || 'System'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {proc.status || 'running'}
                        </span>
                      </td>
                      <td className="p-3">
                        {isSuspicious ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Elevated ({(Number(proc.anomaly_score || 0.4) * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500/70" /> Normal
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProcess(proc);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded border border-slate-700 text-[11px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Process Detail Modal */}
      {selectedProc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProc(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {selectedProc.name} (PID: {selectedProc.pid})
                </h3>
                <p className="text-xs text-slate-400">Deep Behavioral & Execution Context</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 col-span-2">
                <span className="text-slate-400">Executable Binary Path</span>
                <span className="block font-mono text-slate-200 mt-1 break-all select-all">
                  {selectedProc.exe_path || selectedProc.exe || 'Protected System Binary / Unavailable'}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 col-span-2">
                <span className="text-slate-400">Execution Command Line</span>
                <span className="block font-mono text-slate-300 mt-1 break-all bg-slate-950 p-2 rounded border border-slate-800 select-all">
                  {selectedProc.cmdline_str || selectedProc.exe_path || selectedProc.name}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Parent Process (PPID)</span>
                <span className="block font-mono text-slate-200 mt-1">
                  {selectedProc.parent_name || 'N/A'} (PID: {selectedProc.ppid || 'None'})
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Execution Account</span>
                <span className="block font-mono text-slate-200 mt-1">
                  {selectedProc.username || 'System / NT AUTHORITY'}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Process CPU Usage</span>
                <span className="block text-sm font-bold text-blue-400 mt-1">
                  {typeof selectedProc.cpu_percent === 'number' ? selectedProc.cpu_percent.toFixed(1) : 0}%
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Memory Utilization</span>
                <span className="block text-sm font-bold text-indigo-400 mt-1">
                  {typeof selectedProc.memory_percent === 'number' ? selectedProc.memory_percent.toFixed(1) : 0}% ({((selectedProc.memory_rss || 0) / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </div>
            </div>

            {/* Risk & Heuristic Breakdown */}
            <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Security & Anomaly Assessment
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedProc.risk_explanation || 'No malicious behavioral heuristics triggered. Process conforms to learned expectation.'}
              </p>
            </div>

            {/* Non-destructive notice */}
            <div className="text-[11px] text-slate-500 italic bg-slate-950 p-2.5 rounded border border-slate-800">
              Note: Unfamiliar processes are never labeled malware automatically. Destructive process termination is prohibited by monitoring safety policies.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
