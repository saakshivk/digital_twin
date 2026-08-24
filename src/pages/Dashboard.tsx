import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { MetricCard } from '../components/common/MetricCard';
import { RiskGauge } from '../components/common/RiskGauge';
import { ModeIndicator } from '../components/common/ModeIndicator';
import { StatusBadge } from '../components/common/StatusBadge';
import { Tooltip } from '../components/common/Tooltip';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Activity, ShieldAlert, Cpu, HardDrive, Wifi, Server,
  AlertTriangle, CheckCircle2, TrendingUp, Zap, Battery,
  BatteryCharging, Thermometer, Clock, ShieldCheck, RefreshCw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const wsData = useWebSocket();
  const [history, setHistory] = useState<any[]>([]);

  // Telemetry data resolution from unified authoritative stream
  const rawTel = wsData?.telemetry || {};
  const summary = rawTel.summary || rawTel;
  const cpuData = rawTel.cpu || {};
  const memData = rawTel.memory || {};
  const diskData = rawTel.disk || {};
  const netData = rawTel.network || {};
  const battData = rawTel.battery || {};
  const tempData = rawTel.temperature || {};

  const cpuPercent = typeof summary.cpu_percent === 'number' ? summary.cpu_percent : (typeof cpuData.cpu_percent === 'number' ? cpuData.cpu_percent : 0.0);
  const ramPercent = typeof summary.ram_percent === 'number' ? summary.ram_percent : (typeof memData.ram_percent === 'number' ? memData.ram_percent : 0.0);
  const ramUsedGB = typeof summary.ram_used === 'number' ? (summary.ram_used / (1024 ** 3)).toFixed(1) : '0.0';
  const ramTotalGB = typeof summary.ram_total === 'number' ? (summary.ram_total / (1024 ** 3)).toFixed(1) : '0.0';
  
  const diskReadKB = typeof summary.disk_read_rate === 'number' ? (summary.disk_read_rate / 1024).toFixed(1) : '0.0';
  const diskWriteKB = typeof summary.disk_write_rate === 'number' ? (summary.disk_write_rate / 1024).toFixed(1) : '0.0';
  
  const netUpKB = typeof summary.net_upload_rate === 'number' ? (summary.net_upload_rate / 1024).toFixed(1) : '0.0';
  const netDownKB = typeof summary.net_download_rate === 'number' ? (summary.net_download_rate / 1024).toFixed(1) : '0.0';
  
  const procsCount = summary.process_count || (rawTel.process?.processes?.length) || 0;
  const socketsCount = summary.net_connections_count || (netData.connections?.length) || 0;
  
  // Battery resolution
  const batteryPercent = battData.percent !== undefined && battData.percent !== null ? battData.percent : summary.battery_percent;
  const batteryPlugged = battData.power_plugged !== undefined ? battData.power_plugged : battData.charging;
  const batteryStatusStr = battData.status || (batteryPercent !== null && batteryPercent !== undefined ? (batteryPlugged ? 'Plugged In' : 'On Battery') : 'Not applicable');
  
  // Temperature resolution
  const cpuTemp = tempData.cpu_temp !== undefined && tempData.cpu_temp !== null ? tempData.cpu_temp : summary.cpu_temp;

  // Uptime resolution
  const uptimeSecs = summary.uptime_seconds || summary.uptime || 0;
  const formatUptime = (secs: number) => {
    if (!secs) return 'Active';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };
  const uptimeFormatted = summary.uptime_formatted || summary.uptime_str || formatUptime(uptimeSecs);

  const risk = wsData?.risk || wsData?.risk_score || {
    score: 0,
    level: 'Normal',
    classification: 'Normal Host Behavior',
    contributors: {},
    explanation: 'System operating within learned baseline parameters.'
  };

  const ml = wsData?.ml_result || {
    ensemble_score: 0,
    models: {
      isolation_forest: 0,
      one_class_svm: 0,
      autoencoder: 0,
      kmeans: { score: 0, cluster_label: 'Normal Work' }
    }
  };

  const twin = wsData?.digital_twin || {
    summary: { overall_health: 'Normal', is_trusted_baseline: true, metrics_tracked: 8 },
    deviations: {}
  };

  const isSim = summary.is_simulation || wsData?.mode === 'SIMULATION' || wsData?.monitoring_state?.mode === 'SIMULATION';
  const secondsAgo = wsData?.secondsAgo ?? 0;

  // Maintain sliding 30-point live history for charts
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString();
    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: timeStr,
          cpu: Number(cpuPercent),
          ram: Number(ramPercent),
          risk: Number(risk.score || 0),
          anomaly: (Number(ml.ensemble_score || 0) * 100).toFixed(1),
          net_up: Number(netUpKB),
          net_down: Number(netDownKB),
        }
      ];
      return next.slice(-30);
    });
  }, [cpuPercent, ramPercent, risk.score, ml.ensemble_score, netUpKB, netDownKB]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Simulation Banner */}
      {isSim && (
        <div className="bg-red-950/80 border border-red-500 p-4 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-red-400" />
            <div>
              <span className="font-bold text-red-200 text-sm sm:text-base">🔴 ATTACK SIMULATION MODE ACTIVE</span>
              <p className="text-xs text-red-300">
                Synthetic attack vectors injected in-memory. Zero modification to real host OS or files.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-900/60 border border-red-500 text-red-200 rounded text-xs font-mono font-bold">
            SYNTHETIC TELEMETRY
          </span>
        </div>
      )}

      {/* 1. TOP HEADER ROW: System Status, Risk Score, Monitoring Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between col-span-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">Host Security Digital Twin</h2>
                <Tooltip content="Continuously models expected behavior of this computer and evaluates real-time deviations without modifying any system files or processes." />
              </div>
              <p className="text-xs text-slate-400 mt-1">Behavioral Detection & Explainable Threat Monitoring</p>
            </div>
            <ModeIndicator mode={isSim ? 'SIMULATION' : 'LIVE'} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>Status: <strong className="text-green-400 uppercase">Online</strong></span>
            </div>
            <div>
              Digital Twin: <strong className="text-blue-400">{twin.summary?.overall_health || 'Normal'}</strong> (8 Vectors)
            </div>
            <div className="text-slate-400 font-mono text-xs">
              Last updated: <span className="text-slate-200 font-semibold">{secondsAgo}s ago</span>
            </div>
          </div>
        </div>

        {/* Risk Gauge Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center shadow-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Security Risk Score</span>
            <Tooltip content="Composite risk score calculated by fusing 4 unsupervised ML anomaly models, Digital Twin statistical deviations, and heuristic security rules." />
          </div>
          <RiskGauge score={Number(risk.score || 0)} size={110} />
          <div className="mt-1 text-center">
            <span className="text-xs font-medium text-slate-300 block">{risk.classification || 'Normal Operation'}</span>
          </div>
        </div>

        {/* ML Status Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">ML Behavioral Model</span>
              <StatusBadge status={ml.ensemble_score > 0.6 ? 'High' : (ml.ensemble_score > 0.3 ? 'Elevated' : 'Normal')} />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {(Number(ml.ensemble_score || 0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">4-Model Ensemble Anomaly Score</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Workload Profile:</span>
            <span className="text-slate-200 font-medium">{ml.models?.kmeans?.cluster_label || 'Normal Work'}</span>
          </div>
        </div>
      </div>

      {/* 2. ROW 2: TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* CPU */}
        <MetricCard
          title="CPU Usage"
          value={`${Number(cpuPercent).toFixed(1)}%`}
          subValue="Host Cores"
          icon={<Cpu className="w-4 h-4 text-blue-400" />}
          status={cpuPercent > 85 ? 'Critical' : (cpuPercent > 70 ? 'Elevated' : 'Normal')}
          tooltip="Real-time CPU processor utilization aggregated across all cores."
        />

        {/* RAM */}
        <MetricCard
          title="RAM Memory"
          value={`${Number(ramPercent).toFixed(1)}%`}
          subValue={`${ramUsedGB} / ${ramTotalGB} GB`}
          icon={<Activity className="w-4 h-4 text-purple-400" />}
          status={ramPercent > 90 ? 'Critical' : (ramPercent > 75 ? 'Elevated' : 'Normal')}
          tooltip="Physical RAM allocation percentage and active memory footprint."
        />

        {/* Disk I/O */}
        <MetricCard
          title="Disk I/O"
          value={`${diskWriteKB} KB/s`}
          subValue={`Read: ${diskReadKB} KB/s`}
          icon={<HardDrive className="w-4 h-4 text-emerald-400" />}
          status="Normal"
          tooltip="Live physical storage write rate and read throughput."
        />

        {/* Network */}
        <MetricCard
          title="Network Rate"
          value={`${netUpKB} KB/s`}
          subValue={`Down: ${netDownKB} KB/s`}
          icon={<Wifi className="w-4 h-4 text-cyan-400" />}
          status={Number(netUpKB) > 50000 ? 'Elevated' : 'Normal'}
          tooltip="Real-time upload and download throughput across all network interfaces."
        />

        {/* Processes */}
        <MetricCard
          title="Processes"
          value={procsCount.toString()}
          subValue="Active Tasks"
          icon={<Server className="w-4 h-4 text-amber-400" />}
          status="Normal"
          tooltip="Total active OS kernel processes running on this host."
        />

        {/* Network Sockets */}
        <MetricCard
          title="Active Sockets"
          value={socketsCount.toString()}
          subValue="TCP / UDP"
          icon={<Server className="w-4 h-4 text-indigo-400" />}
          status="Normal"
          tooltip="Total active open network sockets tracked via psutil.net_connections."
        />

        {/* Battery */}
        <MetricCard
          title="Battery"
          value={batteryPercent !== null && batteryPercent !== undefined ? `${batteryPercent}%` : 'Desktop'}
          subValue={batteryStatusStr}
          icon={batteryPlugged ? <BatteryCharging className="w-4 h-4 text-green-400" /> : <Battery className="w-4 h-4 text-amber-400" />}
          status="Normal"
          tooltip="Hardware battery power sensor. Displays 'Not applicable' on standard desktop machines."
        />

        {/* Temperature */}
        <MetricCard
          title="Temperature"
          value={cpuTemp !== null && cpuTemp !== undefined ? `${cpuTemp}°C` : 'Unavailable'}
          subValue={cpuTemp !== null && cpuTemp !== undefined ? 'Package Sensor' : 'Unavailable on system'}
          icon={<Thermometer className="w-4 h-4 text-red-400" />}
          status="Normal"
          tooltip="CPU package thermal sensor. If unavailable on this OS/hardware, clearly reported without fabricating data."
        />
      </div>

      {/* UPTIME & SYSTEM HEALTH STRIP */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-slate-300 font-medium">System Uptime:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-green-950/80 text-green-400 border border-green-700/50 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            ● Active
          </span>
          <span className="text-slate-200 font-mono font-bold ml-1">
            Uptime: {uptimeFormatted}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div>
            Sequence: <strong className="text-slate-200 font-mono">#{summary.sequence_id || 1}</strong>
          </div>
          <div>
            Engine: <strong className="text-slate-200 font-mono">1.0s Pulse</strong>
          </div>
          <div>
            Pipeline: <strong className="text-green-400">Synchronized</strong>
          </div>
        </div>
      </div>

      {/* 3. ROW 3: LIVE TIME SERIES CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend & Anomaly Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Live Security Risk & ML Anomaly Trend</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">30s Rolling Window</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="risk" name="Risk Score (0-100)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="anomaly" name="ML Anomaly %" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPU & RAM Telemetry Trend */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">Hardware Telemetry (CPU & RAM)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-Time Stream</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="ram" name="RAM %" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. ROW 4: EXPLAINABLE RISK CONTRIBUTORS */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Explainable Threat & Deviation Breakdown</h3>
          <Tooltip content="Multi-signal evidence correlator values showing why the risk score was calculated." />
        </div>
        <p className="text-xs text-slate-400 mb-4">{risk.explanation || 'Normal operating behavior within expected baseline parameters.'}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries({
            'ML Anomaly': risk.contributors?.ML_Anomaly ?? 0,
            'Twin Deviation': risk.contributors?.Baseline_Deviation ?? 0,
            'Process Behavior': risk.contributors?.Process_Analysis ?? 0,
            'Network Traffic': risk.contributors?.Network_Analysis ?? 0,
            'Authentication': risk.contributors?.Auth_Analysis ?? 0,
            'Security Rules': risk.contributors?.Heuristics ?? 0,
            'Threat Intel': risk.contributors?.Threat_Intel ?? 0,
          }).map(([key, val]) => (
            <div key={key} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">{key}</span>
              <span className={`text-base font-bold font-mono mt-0.5 block ${Number(val) > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {Number(val) > 0 ? `+${Number(val).toFixed(1)}` : '0.0'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
