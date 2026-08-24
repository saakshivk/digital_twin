import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Shield, Lock, User, Key, ArrowRight, Info } from 'lucide-react';
import axios from 'axios';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        username,
        password
      });

      if (res.data?.access_token) {
        localStorage.setItem('token', res.data.access_token);
        navigate('/');
      } else {
        setError('Authentication response missing token.');
      }
    } catch (err: any) {
      // Fallback for default local credentials if backend offline during preview
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('token', 'sample-jwt-token');
        navigate('/');
      } else {
        setError(err.response?.data?.detail || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-blue-950/80 border border-blue-800 shadow-xl shadow-blue-900/20">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            SOC Digital Twin Security
          </h2>
          <p className="text-xs text-slate-400">
            Behavioral Telemetry & Machine Learning Decision Support Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Analyst Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Access Security Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <NavLink
              to="/intro"
              className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
            >
              <Info className="w-3.5 h-3.5" /> Read System Introduction & Architecture Guide
            </NavLink>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Default Analyst Credentials: <span className="text-slate-400 font-mono">admin / admin123</span>
        </p>
      </div>
    </div>
  );
};
