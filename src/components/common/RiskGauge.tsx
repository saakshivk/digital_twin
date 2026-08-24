import React from 'react';

interface RiskGaugeProps {
  score: number;
  level?: string;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, size = 120 }) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score || 0)));
  
  // Calculate level if not provided
  let computedLevel = level;
  if (!computedLevel) {
    if (normalizedScore < 20) computedLevel = 'Normal';
    else if (normalizedScore < 60) computedLevel = 'Low';
    else if (normalizedScore < 80) computedLevel = 'Moderate';
    else if (normalizedScore < 90) computedLevel = 'High';
    else computedLevel = 'Critical';
  }

  // SVG gauge calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = 'text-green-400';
  if (normalizedScore >= 30) color = 'text-yellow-400';
  if (normalizedScore >= 60) color = 'text-orange-400';
  if (normalizedScore >= 80) color = 'text-red-400';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-current text-slate-800"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`stroke-current ${color} transition-all duration-500`}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-xl font-bold font-mono ${color}`}>{normalizedScore}</span>
        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{computedLevel}</span>
      </div>
    </div>
  );
};
