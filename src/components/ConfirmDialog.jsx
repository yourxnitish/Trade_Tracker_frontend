import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-dark-border text-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${isDanger ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-dark-bg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-dark-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-dark-bg border border-dark-border hover:border-slate-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
              isDanger
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;