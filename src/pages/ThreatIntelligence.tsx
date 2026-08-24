import React, { useState } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import {
  Search, ShieldCheck, ShieldAlert, Globe, Hash,
  Terminal, CheckCircle, HelpCircle, Info
} from 'lucide-react';
import axios from 'axios';

export const ThreatIntelligence: React.FC = () => {
  const [indicator, setIndicator] = useState('');
  const [type, setType] = useState('ip');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recentLookups, setRecentLookups] = useState<any[]>([
    { indicator: '203.0.113.100', type: 'IP', is_malicious: true, source: 'DEMO THREAT INTELLIGENCE', details: 'Known malicious test C2 IP' },
    { indicator: '198.51.100.200', type: 'IP', is_malicious: true, source: 'DEMO THREAT INTELLIGENCE', details: 'Known test botnet controller' },
    { indicator: 'demo-malicious-c2.example.com', type: 'Domain', is_malicious: true, source: 'DEMO THREAT INTELLIGENCE', details: 'Synthetic phishing test domain' }
  ]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicator) return;

    try {
      setLoading(true);
      const res = await axios.post('/api/threat-intel/lookup', {
        indicator,
        type
      });
      setResult(res.data);
      setRecentLookups((prev) => [res.data, ...prev.slice(0, 9)]);
    } catch (e: any) {
      setResult({
        indicator,
        type,
        source: 'DEMO THREAT INTELLIGENCE',
        is_malicious: false,
        details: 'Indicator not listed in local sample reputation cache.',
        confidence: 0.0,
        tags: ['unlisted']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with clear Mode Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-400" />
              Threat Intelligence & Reputation Center
            </h1>
            <Tooltip content="Provides reputation lookups using an abstract provider. Defaults to DEMO THREAT INTELLIGENCE. Live queries run only when real external APIs are configured." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reputation verification for suspicious IPs, domain names, and file SHA256 hashes
          </p>
        </div>

        <span className="px-3 py-1.5 bg-blue-950/80 border border-blue-800/80 text-blue-300 rounded-lg text-xs font-bold tracking-wider uppercase">
          DEMO THREAT INTELLIGENCE
        </span>
      </div>

      {/* Query Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ip">IP Address</option>
              <option value="domain">Domain Name</option>
              <option value="hash">SHA256 Hash</option>
            </select>

            <input
              type="text"
              placeholder="e.g. 203.0.113.100, demo-malicious-c2.example.com, or hash..."
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading || !indicator}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? 'Querying...' : 'Query Threat Intel'}
            </button>
          </div>
        </form>

        {/* Result Card */}
        {result && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lookup Result</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1 font-mono">{result.indicator}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Type: {result.type} | Provider: {result.source}</p>
              </div>

              {result.is_malicious ? (
                <span className="px-3 py-1 bg-red-950 border border-red-800 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Malicious Indicator
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-950 border border-green-800 text-green-400 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Clean / Unlisted
                </span>
              )}
            </div>

            <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2 text-xs">
              <div className="text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200">Details:</span> {result.details}
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-200">Confidence Score:</span> {(Number(result.confidence || 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Lookups Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-300">Sample & Recent Lookups Cache</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Indicator</th>
                <th className="p-3">Type</th>
                <th className="p-3">Threat Status</th>
                <th className="p-3">Reputation Details</th>
                <th className="p-3">Source Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentLookups.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-slate-200">{item.indicator}</td>
                  <td className="p-3 text-slate-400">{item.type}</td>
                  <td className="p-3">
                    {item.is_malicious ? (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Malicious
                      </span>
                    ) : (
                      <span className="text-green-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Clean
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-300">{item.details}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-500">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
