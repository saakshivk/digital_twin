import React from 'react';
import { Tooltip } from './Tooltip';

interface StatusBadgeProps {
  status: 'normal' | 'elevated' | 'high' | 'critical' | 'Normal' | 'Elevated' | 'High' | 'Critical' | string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const norm = (status || 'normal').toLowerCase();
  
  const colors: Record<string, string> = {
    normal: 'bg-green-500/20 text-green-400 border-green-500/30',
    elevated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const style = colors[norm] || colors.normal;

  return (
    <Tooltip content={`Current status is ${norm}`}>
      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${style}`}>
        {label || norm.toUpperCase()}
      </span>
    </Tooltip>
  );
};
