import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color = 'cyan' }) => {
  const colors = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400'
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${colors[color]}`} />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
};

export default StatsCard;