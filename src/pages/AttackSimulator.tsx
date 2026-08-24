import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  Zap, Play, Square, AlertTriangle, ShieldCheck,
  Cpu, HardDrive, Wifi, Lock, Activity, Info
} from 'lucide-react';
import axios from 'axios';

export const AttackSimulator: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('cryptomining');
  const [simStatus, setSimStatus] = useState<any>({ is_active: false, mode: 'LIVE' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customCpu, setCustomCpu] = useState(90);
  const [customRam, setCustomRam] = useState(85);
  const [customNet, setCustomNet] = useState(50);

  const fetchStatus = async () => {
    try {
      setError(null);
      const [resStatus, resScenarios] = await Promise.all([
        axios.get('/api/simulation/status'),
        axios.get('/api/simulation/scenarios')
      ]);
      setSimStatus(resStatus.data);
      if (Array.isArray(resScenarios.data)) {
        setScenarios(resScenarios.data);
      }
    } catch (e: any) {
      console.error('Error fetching simulation status', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to sync simulation state');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedScenario === 'custom' ? {
        cpu_percent: customCpu,
        ram_percent: customRam,
        net_upload_rate: customNet * 1024 * 1024
      } : {};

      await axios.post('/api/simulation/start', {
        scenario: selectedScenario,
        parameters: params
      });
      await fetchStatus();
    } catch (e: any) {
      console.error('Error starting simulation', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to launch synthetic simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('/api/simulation/stop');
      await fetchStatus();
    } catch (e: any) {
      console.error('Error stopping simulation', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to stop synthetic simulation');
    } finally {
      setLoading(false);
    }
  };

  const isSimActive = simStatus.is_active || simStatus.mode === 'SIMULATION';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prominent Banner */}
      <div className={`p-6 rounded-xl border transition-all ${
        isSimActive 
          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-bold">
                Safe Synthetic Attack Simulation Sandbox
              </h1>
              <Tooltip content="Modifies synthetic telemetry in-memory only. NEVER modifies real processes, disk files, network connections, or operating system configuration." />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test Digital Twin detection, ML model sensitivities, and heuristic triggers without attacking your computer
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSimActive ? (
              <span className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs tracking-wider animate-pulse flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> SIMULATION MODE ACTIVE
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-green-950 border border-green-800 text-green-400 font-semibold rounded-lg text-xs">
                LIVE MODE
              </span>
            )}

            {isSimActive ? (
              <button
                onClick={handleStop}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-red-600/20"
              >
                <Square className="w-3.5 h-3.5" /> Stop Simulation
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-lg shadow-amber-500/20"
              >
                <Play className="w-3.5 h-3.5" /> Launch Simulation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={fetchStatus}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200 block mb-0.5">Strict Non-Destructive Safety Guarantees</span>
          Simulation passes through the exact same telemetry preprocessing, Digital Twin baseline evaluation, and 4-model ML ensemble pipeline as live data, but operates 100% synthetically in software memory. Stopping simulation instantly restores the live system state.
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'cryptomining', name: 'Cryptomining-like', desc: 'Simulates 90%+ CPU saturation, elevated thermal metrics, and power surges.', icon: Cpu },
          { id: 'network_flood', name: 'Network Flood / DDoS-like', desc: 'Simulates sudden bandwidth surges, packet bursts, and high concurrent sockets.', icon: Wifi },
          { id: 'brute_force', name: 'Brute Force Logon Spikes', desc: 'Simulates rapid failed authentication attempts in compressed time windows.', icon: Lock },
          { id: 'malware', name: 'Multi-Vector Malware Profile', desc: 'Simulates concurrent CPU, disk write, and suspicious process creations.', icon: Activity },
          { id: 'data_exfiltration', name: 'Data Exfiltration Bursts', desc: 'Simulates heavy sustained outbound uploads to unlisted destination endpoints.', icon: Wifi },
          { id: 'ransomware', name: 'Ransomware-like File Activity', desc: 'Simulates rapid disk I/O burst and high frequency file writes (synthetic only).', icon: HardDrive },
        ].map((item) => {
          const isSelected = selectedScenario === item.id;
          return (
            <div
              key={item.id}
              onClick={() => !isSimActive && setSelectedScenario(item.id)}
              className={`p-5 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-amber-950/20 border-amber-500/80 shadow-lg'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              } ${isSimActive ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSelected && (
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    Selected
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-100">{item.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
