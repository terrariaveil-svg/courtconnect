import './NotificationsPage.css';
import logo from '../assets/courtconnect-logo.png';
import type { Notice } from './notificationsData';
import type { Reminder } from './remindersData';
import NoticeIcon from './NoticeIcon';
import { NotifBadge } from './NotifAlerts';

type NotificationsPageProps = {
  userName?: string;
  notices: Notice[];
  reminders: Reminder[];
  unreadCount: number;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
  onViewReminders: () => void;
  onDismissReminders: () => void;
  onHome: () => void;
  onOpenProfile?: () => void;
};

export default function NotificationsPage({
  userName = 'Alex',
  notices,
  reminders,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
  onViewReminders,
  onDismissReminders,
  onHome,
  onOpenProfile,
}: NotificationsPageProps) {
  // This page shows the 3 newest notifications and the 2 soonest reminders.
  const latest = [...notices].sort((a, b) => a.order - b.order).slice(0, 3);
  const nextReminders = [...reminders].sort((a, b) => a.order - b.order).slice(0, 2);
  const dueTodayCount = reminders.filter((r) => r.status === 'due').length;

  return (
    <div className="notif-page">
      {/* Top bar */}
      <header className="notif-nav">
        <button type="button" className="notif-brand" onClick={onHome} aria-label="Go to home">
          <img src={logo} alt="" className="notif-logo" />
          <span>PLAYR</span>
        </button>

        <div className="notif-nav-right">
          <label className="notif-search">
            <input type="text" placeholder="Find a Space" />
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </label>

          <span className="alert-wrap">
            <span className="notif-bell" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </span>
            <NotifBadge count={unreadCount} />
          </span>

          <button
            type="button"
            className="notif-avatar"
            onClick={onOpenProfile}
            aria-label="Open user info"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="notif-main">
        <h1 className="notif-title">Notifications &amp; Reminders</h1>
        <p className="notif-subtitle">
          Booking alerts, upcoming reminders and important updates for your gym and club reservations.
        </p>

        {/* Booking notifications */}
        <section className="notif-card">
          <div className="notif-card-head">
            <div>
              <h2 className="notif-card-title">Booking notifications</h2>
              <p className="notif-card-sub">Recent alerts and updates for your gym and club bookings.</p>
            </div>
            <span className="notif-pill">
              <i className="notif-dot" />
              {unreadCount} unread
            </span>
          </div>

          <ul className="notif-list">
            {latest.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={`notif-row${n.unread ? ' is-unread' : ''}`}
                  onClick={() => onMarkRead(n.id)}
                >
                  <span className="notif-icon">
                    <NoticeIcon type={n.icon} />
                  </span>
                  <span className="notif-row-body">
                    <strong className="notif-row-title">{n.title}</strong>
                    <span className="notif-row-text">{n.text}</span>
                  </span>
                  <span className="notif-row-when">
                    <strong>{n.day}</strong>
                    <span>{n.time}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="notif-actions">
            <button type="button" className="notif-btn notif-btn-yellow" onClick={onViewAll}>
              View all
            </button>
            <button
              type="button"
              className="notif-btn notif-btn-green"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>
        </section>

        {/* Upcoming reminders */}
        <section className="notif-card">
          <div className="notif-card-head">
            <div>
              <h2 className="notif-card-title">Upcoming reminders</h2>
              <p className="notif-card-sub">Quick reminders for your next gym and club reservations.</p>
            </div>
            <span className="notif-pill">
              <i className="notif-dot" />
              {dueTodayCount} due today
            </span>
          </div>

          {nextReminders.length === 0 ? (
            <p className="notif-empty">No reminders right now. New ones show up here before your bookings.</p>
          ) : (
            <ul className="notif-list">
              {nextReminders.map((r) => (
                <li key={r.id} className="notif-row notif-row-static">
                  <span className="notif-icon">
                    <NoticeIcon type="calendar" />
                  </span>
                  <span className="notif-row-body">
                    <strong className="notif-row-title">{r.title}</strong>
                    <span className="notif-row-text">{r.text}</span>
                  </span>
                  <span className="notif-row-when">
                    <strong>{r.day}</strong>
                    <span>{r.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="notif-actions">
            <button type="button" className="notif-btn notif-btn-yellow" onClick={onViewReminders}>
              View reminders
            </button>
            <button
              type="button"
              className="notif-btn notif-btn-green"
              onClick={onDismissReminders}
              disabled={reminders.length === 0}
            >
              Dismiss
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}