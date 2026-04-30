'use client';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

export function Toast({ message, tone = 'info', onClose }: { message: string; tone?: ToastTone; onClose?: () => void }) {
  if (!message) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      <div className={`toast toast-${tone}`}>
        <span className="toast-marker" aria-hidden="true" />
        <span>{message}</span>
        {onClose ? (
          <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">×</button>
        ) : null}
      </div>
    </div>
  );
}
