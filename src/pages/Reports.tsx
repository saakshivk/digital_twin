import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  FileText, Download, Printer, ShieldCheck,
  Calendar, CheckCircle, Clock, AlertTriangle,
  Server, Cpu, Activity, ShieldAlert, Zap, RefreshCw
} from 'lucide-react';
import axios from 'axios';

export const Reports: React.FC = () => {
  const [hours, setHours] = useState(24);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (selectedHours = hours) => {
    try {
      setGenerating(true);
      setError(null);
      const res = await axios.post('/api/reports/generate', {
        title: 'Comprehensive Host Security & Digital Twin Audit Report',
        hours: selectedHours
      });
      setReport(res.data);
    } catch (e: any) {
      console.error('Error generating report', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to compile security report from database');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate(24);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100">
              Security Reporting & Executive Audits
            </h1>
            <Tooltip content="Generates technical audit reports distinguishing REAL TELEMETRY from SIMULATED TELEMETRY." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exportable security compliance, ML anomaly assessments, and behavioral deviation summaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={hours}
            onChange={(e) => {
              const h = Number(e.target.value);
              setHours(h);
              handleGenerate(h);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value={1}>Last 1 Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last 7 Days</option>
          </select>

          <button
            onClick={() => handleGenerate(hours)}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Compiling Report...' : 'Regenerate Report'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs print:hidden">
          <span>{error}</span>
          <button
            onClick={() => handleGenerate(hours)}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {generating && !report && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Compiling Security & Audit Report...</h3>
          <p className="text-xs text-slate-500 mt-1">Aggregating real hardware telemetry, process tables, and alert logs from database.</p>
        </div>
      )}

      {/* Generated Report View */}
      {report ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          {/* Report Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  report.is_simulation
                    ? 'bg-amber-950 border border-amber-800 text-amber-400'
                    : 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                }`}>
                  {report.data_classification || 'REAL TELEMETRY'}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {report.report_id}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 mt-2">{report.title}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Period: {report.monitoring_period} | Generated: {new Date(report.generated_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 font-semibold print:hidden"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
          </div>

          {/* Section 1: Host System & Hardware Architecture */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-400" /> 1. Host System Environment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Hostname</span>
                <span className="block font-bold text-slate-200 mt-1">{report.system_info?.hostname}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Operating System</span>
                <span className="block font-bold text-slate-200 mt-1 truncate">{report.system_info?.os_name}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Processor Cores</span>
                <span className="block font-bold text-slate-200 mt-1">{report.system_info?.cpu_cores}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Physical Memory & Battery</span>
                <span className="block font-bold text-slate-200 mt-1">{report.system_info?.total_ram_gb} GB RAM | {report.system_info?.battery_status}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Executive Security & Risk Summary */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> 2. Security Risk Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <span className="text-slate-400">Current Security Risk Score</span>
                <span className="block text-2xl font-black text-slate-100 mt-1">
                  {report.risk_summary?.current_score || 0}/100 ({report.risk_summary?.current_level || 'Normal'})
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Average: {report.risk_summary?.average_score} | Peak: {report.risk_summary?.peak_score}</p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <span className="text-slate-400">Behavioral Classification</span>
                <span className="block text-xl font-bold text-green-400 mt-1">
                  {report.risk_summary?.classification || 'Normal Host Operation'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Operating within statistical baseline parameters</p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <span className="text-slate-400">Total Recorded Alerts</span>
                <span className="block text-2xl font-black text-indigo-400 mt-1">
                  {report.alerts_summary?.total_alerts || 0} alerts
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Across selected evaluation timeframe</p>
              </div>
            </div>
          </div>

          {/* Section 3: Telemetry Statistics */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" /> 3. Host Workload & Telemetry Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                <span className="text-slate-400">Average CPU Load</span>
                <span className="block font-bold text-slate-200 mt-0.5">{report.telemetry_summary?.average_cpu_percent}% (Peak: {report.telemetry_summary?.peak_cpu_percent}%)</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                <span className="text-slate-400">Average RAM Load</span>
                <span className="block font-bold text-slate-200 mt-0.5">{report.telemetry_summary?.average_ram_percent}% (Peak: {report.telemetry_summary?.peak_ram_percent}%)</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                <span className="text-slate-400">Active Processes</span>
                <span className="block font-bold text-slate-200 mt-0.5">{report.telemetry_summary?.total_active_processes} tracked</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                <span className="text-slate-400">Active Sockets</span>
                <span className="block font-bold text-slate-200 mt-0.5">{report.telemetry_summary?.total_active_sockets} connections</span>
              </div>
            </div>
          </div>

          {/* Section 4: Top Processes */}
          {report.top_processes && report.top_processes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> 4. Top Resource Consuming Processes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2.5">PID</th>
                      <th className="p-2.5">Process Name</th>
                      <th className="p-2.5">CPU %</th>
                      <th className="p-2.5">RAM %</th>
                      <th className="p-2.5">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.top_processes.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono text-slate-400">{p.pid}</td>
                        <td className="p-2.5 font-semibold text-slate-200">{p.name}</td>
                        <td className="p-2.5 font-mono text-blue-400">{p.cpu_percent?.toFixed(1)}%</td>
                        <td className="p-2.5 font-mono text-indigo-400">{p.memory_percent?.toFixed(1)}%</td>
                        <td className="p-2.5 text-slate-400">{p.username || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: SOC Recommendations */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-400" /> 5. Actionable SOC Recommendations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.recommendations?.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Report Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Generate Report" above to compile a comprehensive security and telemetry audit for the selected timeframe.
          </p>
        </div>
      )}
    </div>
  );
};
