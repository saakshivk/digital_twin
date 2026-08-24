import React from 'react';
import { Tooltip } from './Tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  tooltip: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'elevated' | 'high' | 'critical' | 'Normal' | 'Elevated' | 'High' | 'Critical' | string;
  /** Accept either a pre-rendered JSX element or a component class/function */
  icon?: React.ReactNode;
  subValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  tooltip,
  trend,
  status = 'normal',
  icon,
  subValue
}) => {
  const normStatus = (status || 'normal').toLowerCase();
  const statusColors: Record<string, string> = {
    normal: 'text-green-400',
    elevated: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };

  return (
    <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/70 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <Tooltip content={tooltip}>
          <h3 className="text-slate-400 text-xs font-medium cursor-help border-b border-dashed border-slate-600 truncate max-w-[90px]">
            {title}
          </h3>
        </Tooltip>
        {icon ? (
          <span className="shrink-0">{icon}</span>
        ) : trend ? (
          <span className={`text-xs ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-slate-400'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        ) : null}
      </div>

      <div>
        <div className="flex items-baseline">
          <span className={`text-xl font-bold ${statusColors[normStatus] || 'text-slate-100'}`}>
            {value}
          </span>
          {unit && <span className="ml-1 text-slate-400 text-xs">{unit}</span>}
        </div>
        {subValue && (
          <span className="block text-[10px] text-slate-400 mt-0.5 truncate">{subValue}</span>
        )}
      </div>
    </div>
  );
};
