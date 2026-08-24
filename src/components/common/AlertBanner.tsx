import React from 'react';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  isSimulationMode?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, isSimulationMode }) => {
  if (isSimulationMode) {
    return (
      <div className="bg-amber-500/20 border-l-4 border-amber-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-amber-500 font-bold">SIMULATION MODE ACTIVE</span>
          </div>
          <div className="ml-3">
            <p className="text-amber-200">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  const colors = {
    info: 'bg-blue-500/20 border-blue-500 text-blue-200',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-200',
    error: 'bg-red-500/20 border-red-500 text-red-200',
    success: 'bg-green-500/20 border-green-500 text-green-200',
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${colors[type]}`}>
      <p>{message}</p>
    </div>
  );
};
