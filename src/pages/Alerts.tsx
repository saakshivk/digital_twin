import React, { useState, useEffect } from 'react';
import { Tooltip } from '../components/common/Tooltip';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Bell, ShieldAlert, CheckCircle, Filter,
  RefreshCw, Eye, AlertTriangle, ShieldCheck, X
} from 'lucide-react';
import axios from 'axios';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/alerts');
      if (Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    } catch (e: any) {
      console.error('Error fetching alerts', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to retrieve security alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.put(`/api/alerts/${id}/status`, { status, resolved_by: 'admin' });
      fetchAlerts();
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev: any) => ({ ...prev, status }));
      }
    } catch (e) {
      console.error('Error updating alert status', e);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return (a.severity || '').toUpperCase() === filterSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Security Alerts & Behavioral Incidents
            </h1>
            <Tooltip content="Alerts are triggered when multi-signal risk scores cross critical thresholds or explicit heuristics fire. Never modifies your operating system." />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable evidence triage with manual investigation workflows and false positive feedback
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={fetchAlerts}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Alert Title</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Loading recorded security alerts...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No active alerts matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="p-3 font-mono text-slate-400">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={alert.severity as any} />
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {alert.risk_score}/100
                    </td>
                    <td className="p-3 font-semibold text-slate-100">
                      {alert.title}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {alert.status || 'New'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded border border-slate-700 text-[11px]"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Investigation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedAlert.title}</h3>
                <p className="text-xs text-slate-400">Alert ID: #{selectedAlert.id} | Score: {selectedAlert.risk_score}/100</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                <span className="font-semibold text-slate-200 block mb-1">Incident Explanation:</span>
                <p className="text-slate-300 leading-relaxed">{selectedAlert.description}</p>
              </div>

              {selectedAlert.evidence && (
                <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/50">
                  <span className="font-semibold text-slate-200 block mb-2">Correlated Telemetry Evidence:</span>
                  <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto bg-slate-950 p-2.5 rounded border border-slate-800">
                    {JSON.stringify(selectedAlert.evidence, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(selectedAlert.id, 'Acknowledged')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 font-semibold"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => updateStatus(selectedAlert.id, 'False Positive')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700"
                >
                  Mark False Positive
                </button>
                <button
                  onClick={() => updateStatus(selectedAlert.id, 'Resolved')}
                  className="px-3 py-1.5 bg-green-900/60 hover:bg-green-800 text-green-300 rounded text-xs border border-green-700 font-semibold"
                >
                  Resolve Alert
                </button>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
