import React from 'react';

const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend, // 'up', 'down', 'neutral'
  badgeText,
  colorScheme = 'blue', // 'blue', 'green', 'red', 'purple', 'amber'
  tooltip
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    green: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    red: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider" title={tooltip}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </h3>
            {badgeText && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${scheme.bg} ${scheme.text}`}>
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
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} flex-shrink-0 transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
