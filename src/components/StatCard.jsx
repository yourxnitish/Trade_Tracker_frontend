import React from 'react';

const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  badgeText,
  colorScheme = 'green', // 'green', 'red', 'blue', 'purple', 'amber'
  tooltip
}) => {
  const colorMap = {
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/5',
    },
    red: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/5',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/5',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/5',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/5',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.green;

  return (
    <div className={`bg-[#0f1726] rounded-2xl p-5 border border-[#1e293b] shadow-lg hover:border-slate-700 transition-all relative overflow-hidden group ${scheme.glow}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono" title={tooltip}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className={`text-2xl font-black tracking-tight font-mono ${scheme.text}`}>
              {value}
            </h3>
            {badgeText && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.bg} ${scheme.text} ${scheme.border}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subValue && (
            <p className="text-xs text-slate-500 font-medium">
              {subValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border} flex-shrink-0 transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
