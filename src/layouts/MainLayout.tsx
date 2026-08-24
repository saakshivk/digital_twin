import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Cpu, Brain, Activity, Network, 
  Shield, Search, Bell, Clock, Zap, BookOpen, 
  BarChart3, FileText, Settings, LogOut, Info
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/intro', label: 'Introduction Guide', icon: Info },
  { path: '/twin', label: 'Digital Twin', icon: Cpu },
  { path: '/ml', label: 'ML Analysis', icon: Brain },
  { path: '/process', label: 'Process Monitor', icon: Activity },
  { path: '/network', label: 'Network Monitor', icon: Network },
  { path: '/auth', label: 'Auth Events', icon: Shield },
  { path: '/threat-intel', label: 'Threat Intelligence', icon: Search },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/timeline', label: 'Security Timeline', icon: Clock },
  { path: '/simulator', label: 'Attack Simulator', icon: Zap },
  { path: '/knowledge', label: 'Threat Knowledge', icon: BookOpen },
  { path: '/history', label: 'Historical Analysis', icon: BarChart3 },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const MainLayout: React.FC = () => {
  const wsData = useWebSocket();
  const navigate = useNavigate();

  const isSim = wsData?.telemetry?.summary?.is_simulation || wsData?.monitoring_state?.mode === 'SIMULATION';
  const riskScore = wsData?.risk?.score || 0;
  const riskLevel = wsData?.risk?.level || 'Normal';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-blue-950 border border-blue-800">
            <Shield className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-slate-100 text-sm tracking-tight leading-tight">Digital Twin SOC</h1>
            <p className="text-[11px] text-slate-400">Security Monitoring</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-2.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                      isActive 
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-slate-400 hover:text-red-400 text-xs font-semibold w-full px-3 py-2 rounded-lg hover:bg-slate-800/80 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout Analyst
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-md">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-slate-300 font-semibold">Monitoring: Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-4">
              <span>Risk:</span>
              <span className={`font-bold ${riskScore > 60 ? 'text-red-400' : riskScore > 35 ? 'text-amber-400' : 'text-green-400'}`}>
                {riskScore.toFixed(0)}/100 ({riskLevel})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSim ? (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                SIMULATION MODE
              </span>
            ) : (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
                LIVE TELEMETRY
              </span>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-300 font-bold text-xs">
                A
              </div>
              <span className="text-slate-200 font-semibold hidden md:inline">Admin Analyst</span>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
