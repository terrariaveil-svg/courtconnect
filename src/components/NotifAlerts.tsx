import './NotifAlerts.css';

type NotifBadgeProps = {
  count: number;
};

export function NotifBadge({ count }: NotifBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="alert-badge" aria-label={`${count} unread notifications`}>
      {count > 9 ? '9+' : count}
    </span>
  );
}

type UnreadToastProps = {
  count: number;
  onView: () => void;
  onClose: () => void;
};

export function UnreadToast({ count, onView, onClose }: UnreadToastProps) {
  return (
    <div className="alert-toast" role="status" aria-live="polite">
      <span className="alert-toast-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </span>

      <div className="alert-toast-body">
        <strong>
          {count === 1 ? 'You have 1 unread notification' : `You have ${count} unread notifications`}
        </strong>
        <span>Booking alerts and reminders are waiting for you.</span>

        <div className="alert-toast-actions">
          <button type="button" className="alert-toast-view" onClick={onView}>
            View
          </button>
          <button type="button" className="alert-toast-later" onClick={onClose}>
            Later
          </button>
        </div>
      </div>

      <button type="button" className="alert-toast-close" aria-label="Dismiss" onClick={onClose}>
        ×
      </button>
    </div>
  );
}