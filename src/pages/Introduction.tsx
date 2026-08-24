import React from 'react';
import {
  Shield, Cpu, Brain, Activity, CheckCircle,
  AlertTriangle, Layers, BookOpen, Lock, Terminal
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Introduction: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-900/60 p-8 rounded-2xl shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              AI-Based Digital Twin Security Monitoring System
            </h1>
            <p className="text-xs text-blue-300">
              Continuous Behavioral Modeling, Machine Learning Ensemble & Explainable Incident Decision Support
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed pt-2">
          This system builds and maintains a real-time behavioral <strong>Digital Twin</strong> of the host computer. Rather than relying solely on static virus signatures or universal static thresholds, the Digital Twin learns the personalized normal baseline of your specific machine across diverse operating contexts (idle, development, gaming, heavy workloads) and evaluates multi-signal deviations using an ensemble of four distinct machine learning models.
        </p>

        <div className="flex gap-3 pt-2">
          <NavLink
            to="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition"
          >
            Launch Live SOC Dashboard
          </NavLink>
          <NavLink
            to="/knowledge"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            Explore Threat Knowledge Center
          </NavLink>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
          <Cpu className="w-8 h-8 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">1. Behavioral Digital Twin</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Constructs a personalized expectation model using moving averages, Z-score thresholds, and gradual baseline adaptation protected against adversarial baseline poisoning.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
          <Brain className="w-8 h-8 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">2. 4-Model ML Ensemble</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fuses normalized scores from Isolation Forest (30%), One-Class SVM (25%), Neural Autoencoder (30%), and K-Means Context Clustering (15%) into a calibrated anomaly index.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
          <Activity className="w-8 h-8 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">3. Transparent Explainability</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every risk calculation decomposes into exact contributor points (+18 Network, +14 Process, +10 ML). Never equates simple anomalies with malware.
          </p>
        </div>
      </div>

      {/* Philosophy & Safety Guarantees */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          System Principles & Safety Boundaries
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1.5 p-3.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="font-bold text-slate-100">Monitoring & Decision Support Only</span>
            <p className="text-slate-400">
              The system never automatically terminates processes, deletes files, modifies OS configuration, or executes destructive remediation actions.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="font-bold text-slate-100">Honest Telemetry & Zero Fabrication</span>
            <p className="text-slate-400">
              Unsupported sensors or platform APIs display "Unavailable on this system" rather than fabricating fake telemetry, temperatures, or accuracy metrics.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="font-bold text-slate-100">Non-Destructive Attack Simulation</span>
            <p className="text-slate-400">
              Synthetic simulation scenarios inject synthetic metrics in software memory only, allowing safe demonstration without endangering the host computer.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="font-bold text-slate-100">Anomaly != Malware</span>
            <p className="text-slate-400">
              Elevated compute (e.g. gaming, software compilation) is categorized contextually without false-positive malware alarms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
