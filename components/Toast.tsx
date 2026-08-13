'use client';

import type { ReactElement } from 'react';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

const ICONS: Record<ToastTone, ReactElement> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 10.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.3 7.3l5.4 5.4M12.7 7.3l-5.4 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3.2l8 14H2l8-14z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 8.3v3.6M10 14.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 9.3v4.4M10 6.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
};

export function Toast({ message, tone = 'info', onClose }: { message: string; tone?: ToastTone; onClose?: () => void }) {
  if (!message) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      <div className={`toast toast-${tone}`}>
        <span className="toast-icon">{ICONS[tone]}</span>
        <span className="toast-message">{message}</span>
        {onClose ? (
          <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">×</button>
        ) : null}
      </div>
    </div>
  );
}
