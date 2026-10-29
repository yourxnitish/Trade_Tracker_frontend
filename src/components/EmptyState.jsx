import React from 'react';
import { Inbox, Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data available",
  description = "Get started by creating your first entry.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-dark-card rounded-2xl border border-dashed border-dark-border">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border text-emerald-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;