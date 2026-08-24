import React from 'react';

interface ModeIndicatorProps {
  mode: 'LIVE' | 'SIMULATION' | 'DEGRADED';
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({ mode }) => {
  const styles = {
    LIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    SIMULATION: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse',
    DEGRADED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className={`px-3 py-1 rounded border font-bold text-sm tracking-wide ${styles[mode]}`}>
      {mode} MODE
    </div>
  );
};
