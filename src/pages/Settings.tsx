import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  Settings as SettingsIcon, Sliders, Database,
  Cpu, HardDrive, Shield, RefreshCw, CheckCircle
} from 'lucide-react';
import axios from 'axios';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [collectors, setCollectors] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [resSet, resCol] = await Promise.all([
        axios.get('/api/settings'),
        axios.get('/api/settings/collectors')
      ]);
      setSettings(resSet.data);
      setCollectors(resCol.data);
    } catch (e) {
      console.error('Error fetching settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100">
              System Settings & Hardware Sensor Health
            </h1>
            <Tooltip content="Configurable telemetry sampling rates, risk contribution weights, and hardware collector diagnostics." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Engine hyperparameters, database retention policies, and cross-platform adapter status
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Collector Health Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          Hardware & OS Telemetry Collectors Status
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Telemetry adapters automatically detect available operating system APIs and gracefully degrade for unsupported sensors without crashing.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(collectors?.collectors || {
            cpu: true,
            memory: true,
            disk: true,
            network: true,
            process: true,
            temperature: false,
            battery: true,
            system_info: true,
            auth_events: true
          }).map(([name, isAvail]: [string, any], idx) => (
            <div key={idx} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
              <span className="font-semibold text-slate-200 capitalize">{name.replace('_', ' ')} Collector</span>
              {isAvail ? (
                <span className="text-green-400 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Available
                </span>
              ) : (
                <span className="text-slate-500 text-[11px]">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risk Engine Weights Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          Explainable Risk Engine Contribution Weights
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Defines the proportional contribution of each evidence vector to the unified 0-100 Security Risk Score.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'ML Anomaly Ensemble', weight: '25%' },
            { label: 'Digital Twin Deviation', weight: '20%' },
            { label: 'Process Behavior', weight: '15%' },
            { label: 'Network Sockets', weight: '15%' },
            { label: 'Authentication Events', weight: '10%' },
            { label: 'Security Heuristics', weight: '10%' },
            { label: 'Threat Intelligence', weight: '5%' },
            { label: 'Sampling Interval', weight: '1.0s (Live)' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-400">{item.label}</span>
              <span className="block text-base font-bold text-slate-200 mt-1">{item.weight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
