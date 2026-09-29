import React from 'react';

interface ToastNotificationProps {
  message: string | null;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-2xl border border-outline-variant/30 animate-slideUp max-w-md">
      <span
        className={`material-symbols-outlined text-[20px] ${
          type === 'error'
            ? 'text-error'
            : type === 'info'
            ? 'text-secondary-fixed'
            : 'text-primary-fixed'
        }`}
      >
        {type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle'}
      </span>
      <span className="text-[13px] font-medium leading-tight flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded text-secondary-fixed-dim hover:text-inverse-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
