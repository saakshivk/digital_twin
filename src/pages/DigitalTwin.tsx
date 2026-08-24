import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Tooltip } from '../components/common/Tooltip';
import { StatusBadge } from '../components/common/StatusBadge';
import { ModeIndicator } from '../components/common/ModeIndicator';
import {
  Cpu, Activity, CheckCircle, AlertTriangle, RefreshCw,
  Shield, Layers, Gauge, Info, HardDrive, Wifi, Server, Battery
} from 'lucide-react';
import axios from 'axios';

export const DigitalTwin: React.FC = () => {
  const wsData = useWebSocket();
  const [twinData, setTwinData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTwinState = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/twin/state');
      setTwinData(res.data);
    } catch (e) {
      console.error('Error fetching digital twin state', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinState();
  }, []);

  // Synchronized telemetry from authoritative stream
  const rawTel = wsData?.telemetry || {};
  const summary = rawTel.summary || rawTel;
  const isSim = summary.is_simulation || wsData?.mode === 'SIMULATION';

  const deviations = wsData?.digital_twin?.deviations || twinData?.deviations || {};
  const twinSummary = wsData?.digital_twin?.summary || twinData?.summary || {
    overall_health: 'Normal',
    is_trusted_baseline: true,
    metrics_tracked: 8
  };

  const metricMeta: Record<string, { label: string; unit: string; icon: any }> = {
    cpu_percent: { label: 'CPU Utilization', unit: '%', icon: Cpu },
    ram_percent: { label: 'RAM Memory Footprint', unit: '%', icon: Activity },
    disk_usage: { label: 'Disk Storage Usage', unit: '%', icon: HardDrive },
    net_upload_rate: { label: 'Network Upload Throughput', unit: 'B/s', icon: Wifi },
    net_download_rate: { label: 'Network Download Throughput', unit: 'B/s', icon: Wifi },
    process_count: { label: 'Active Process Count', unit: ' procs', icon: Server },
    net_connections_count: { label: 'Active Sockets', unit: ' conns', icon: Server },
    cpu_temp: { label: 'Thermal Zone Temperature', unit: '°C', icon: Activity },
    battery_percent: { label: 'Battery Capacity', unit: '%', icon: Battery }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-400" />
              Behavioral Digital Twin Architecture
            </h1>
            <Tooltip content="The Digital Twin maintains a statistical baseline and dynamic state model of this computer's normal operating behavior." />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic Expectation Modeling vs Live System State with Baseline Poisoning Protection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ModeIndicator mode={isSim ? 'SIMULATION' : 'LIVE'} />
          <button
            onClick={fetchTwinState}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Twin
          </button>
        </div>
      </div>

      {/* State Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Twin Synchronization</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-100">
            {isSim ? 'Simulation Overlaid' : 'Live Synchronized'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Sequence #{summary.sequence_id || 1} • Continuous 1.0s stream</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Baseline Trust State</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-100">
            {twinSummary.is_trusted_baseline ? 'Trusted & Active' : 'Learning Phase'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Gated with z-score anomaly rejection protection</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Overall Twin Health</span>
            <StatusBadge status={twinSummary.overall_health || 'Normal'} />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-100">
            {twinSummary.overall_health || 'Normal'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Tracking {twinSummary.metrics_tracked || 8} primary metric vectors</p>
        </div>
      </div>

      {/* Deviations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Metric Vector Deviations (Expected vs Actual)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-Time Twin Comparator</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Metric Vector</th>
                <th className="p-4">Live Actual</th>
                <th className="p-4">Learned Baseline</th>
                <th className="p-4">Expected Value</th>
                <th className="p-4">Statistical Deviation</th>
                <th className="p-4 text-right">Deviation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.keys(deviations).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Synchronizing live baseline deviations with Digital Twin engine...
                  </td>
                </tr>
              ) : (
                Object.entries(deviations).map(([key, item]: [string, any]) => {
                  const meta = metricMeta[key] || { label: key, unit: '', icon: Activity };
                  const Icon = meta.icon;
                  const currentVal = typeof item.current === 'number' ? item.current.toFixed(1) : (item.current ?? 'N/A');
                  const expectedVal = typeof item.expected === 'number' ? item.expected.toFixed(1) : (item.expected ?? 'N/A');
                  const baselineMean = typeof item.baseline?.mean === 'number' ? item.baseline.mean.toFixed(1) : (item.baseline?.mean ?? 'Adapting');
                  const devScore = typeof item.deviation === 'number' ? item.deviation.toFixed(2) : (item.deviation ?? '0.00');

                  return (
                    <tr key={key} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-medium text-slate-100 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{meta.label}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-100">
                        {currentVal}{meta.unit}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {baselineMean}{meta.unit !== 'N/A' && typeof baselineMean === 'number' ? meta.unit : ''}
                      </td>
                      <td className="p-4 font-mono text-blue-400">
                        {expectedVal}{meta.unit}
                      </td>
                      <td className="p-4 font-mono">
                        <span className={Number(devScore) > 2 ? 'text-red-400 font-bold' : (Number(devScore) > 1 ? 'text-amber-400' : 'text-slate-400')}>
                          {Number(devScore) > 0 ? `+${devScore}` : devScore}σ
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <StatusBadge status={item.status || 'Normal'} />
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
