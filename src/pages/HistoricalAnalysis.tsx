import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  BarChart3, Calendar, TrendingUp, RefreshCw,
  Cpu, HardDrive, Wifi, Activity, Server, ShieldAlert
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import axios from 'axios';

export const HistoricalAnalysis: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [riskHistory, setRiskHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHoursFromRange = (range: string) => {
    switch (range) {
      case '1h': return 1;
      case '24h': return 24;
      case '7d': return 168;
      case '30d': return 720;
      default: return 24;
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const hours = getHoursFromRange(timeRange);
      const [resTel, resRisk] = await Promise.allSettled([
        axios.get(`/api/telemetry/history?limit=150&hours=${hours}`),
        axios.get(`/api/security/risk/history?limit=150&hours=${hours}`)
      ]);

      if (resTel.status === 'fulfilled' && Array.isArray(resTel.value.data)) {
        setHistory(resTel.value.data);
      }
      if (resRisk.status === 'fulfilled' && Array.isArray(resRisk.value.data)) {
        setRiskHistory(resRisk.value.data);
      }
    } catch (e: any) {
      console.error('Error fetching historical telemetry', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to query historical telemetry database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [timeRange]);

  // Combine and format chart data
  const chartData = history.map((item, idx) => {
    const riskItem = riskHistory[idx] || {};
    const dt = item.timestamp ? new Date(item.timestamp) : new Date();
    const timeStr = timeRange === '1h' || timeRange === '24h'
      ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : `${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:00`;

    return {
      time: timeStr,
      cpu: typeof item.cpu_percent === 'number' ? Number(item.cpu_percent.toFixed(1)) : 0,
      ram: typeof item.ram_percent === 'number' ? Number(item.ram_percent.toFixed(1)) : 0,
      net_up: typeof item.net_upload_rate === 'number' ? Number((item.net_upload_rate / 1024).toFixed(1)) : 0,
      net_down: typeof item.net_download_rate === 'number' ? Number((item.net_download_rate / 1024).toFixed(1)) : 0,
      disk_write: typeof item.disk_write_rate === 'number' ? Number((item.disk_write_rate / 1024).toFixed(1)) : 0,
      disk_read: typeof item.disk_read_rate === 'number' ? Number((item.disk_read_rate / 1024).toFixed(1)) : 0,
      procs: item.process_count || 0,
      risk: typeof riskItem.overall_score === 'number' ? Number(riskItem.overall_score.toFixed(1)) : 0
    };
  }).reverse();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100">
              Historical Telemetry & Long-Term Trends
            </h1>
            <Tooltip content="Historical database queries across resource workloads, anomaly trends, and security risk scores." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing persistent behavioral drift and historical baseline deviations across {chartData.length} records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded font-semibold transition ${
                  timeRange === range ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Query
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={fetchHistory}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Historical Charts Content */}
      {loading && chartData.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Querying Historical Database Records...</h3>
          <p className="text-xs text-slate-500 mt-1">Retrieving persisted telemetry snapshots and risk calculations.</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center space-y-3">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Historical Telemetry Recorded Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The background monitoring service periodically commits snapshots to the database every few seconds. Once telemetry has accumulated, trends and historical time series charts will populate here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Risk History */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Historical Security Risk Score Progression
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="histRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} fill="url(#histRisk)" name="Risk Score (0-100)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. CPU & Memory History */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              CPU & Memory Utilization History
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="cpu" stroke="#38bdf8" strokeWidth={2} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="ram" stroke="#818cf8" strokeWidth={2} dot={false} name="RAM %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Network Throughput History */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              Network Traffic Volume (KB/s)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="net_up" stroke="#06b6d4" strokeWidth={2} dot={false} name="Upload (KB/s)" />
                  <Line type="monotone" dataKey="net_down" stroke="#6366f1" strokeWidth={2} dot={false} name="Download (KB/s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Disk I/O History */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Disk Read & Write Throughput (KB/s)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="disk_write" stroke="#10b981" strokeWidth={2} dot={false} name="Disk Write (KB/s)" />
                  <Line type="monotone" dataKey="disk_read" stroke="#14b8a6" strokeWidth={2} dot={false} name="Disk Read (KB/s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
