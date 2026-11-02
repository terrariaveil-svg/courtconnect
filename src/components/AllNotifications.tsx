import { useState } from 'react';
import './AllNotifications.css';
import logo from '../assets/courtconnect-logo.png';
import type { Notice } from './notificationsData';
import NoticeIcon from './NoticeIcon';
import { NotifBadge } from './NotifAlerts';

type AllNotificationsProps = {
  userName?: string;
  notices: Notice[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onViewBooking: (id: number) => void;
  onBack: () => void;
  onHome: () => void;
  onOpenProfile?: () => void;
};

type Tab = 'all' | 'unread' | 'read';
type Sort = 'newest' | 'oldest';

const PAGE_SIZE = 6;

export default function AllNotifications({
  userName = 'Alex',
  notices,
  unreadCount,
  onMarkAllRead,
  onViewBooking,
  onBack,
  onHome,
  onOpenProfile,
}: AllNotificationsProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [page, setPage] = useState(1);

  const readCount = notices.length - unreadCount;

  const q = query.trim().toLowerCase();
  const filtered = notices
    .filter((n) => {
      if (tab === 'unread' && !n.unread) return false;
      if (tab === 'read' && n.unread) return false;
      if (!q) return true;
      return `${n.title} ${n.text} ${n.type} ${n.day}`.toLowerCase().includes(q);
    })
    .sort((a, b) => (sort === 'newest' ? a.order - b.order : b.order - a.order));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const from = filtered.length === 0 ? 0 : startIndex + 1;
  const to = startIndex + pageItems.length;

  const changeTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div className="all-page">
      {/* Top bar */}
      <header className="all-nav">
        <button type="button" className="all-brand" onClick={onHome} aria-label="Go to home">
          <img src={logo} alt="" className="all-logo" />
          <span>PLAYR</span>
        </button>

        <div className="all-nav-right">
          <label className="all-nav-search">
            <input type="text" placeholder="Find a Space" />
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </label>

          <span className="alert-wrap">
            <span className="all-bell" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </span>
            <NotifBadge count={unreadCount} />
          </span>

          <button
            type="button"
            className="all-avatar"
            onClick={onOpenProfile}
            aria-label="Open user info"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="all-main">
        <button type="button" className="all-back" onClick={onBack}>
          ← Notifications &amp; Reminders
        </button>

        <div className="all-head">
          <div>
            <h1 className="all-title">All booking notifications</h1>
            <p className="all-subtitle">
              All alerts and updates for your gym and club bookings, in one place.
            </p>
          </div>

          <div className="all-head-right">
            <span className="all-pill">
              <i className="all-dot" />
              {unreadCount} unread
            </span>
            <button
              type="button"
              className="all-mark-btn"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>
        </div>

        <section className="all-card">
          {/* Tabs + search + sort */}
          <div className="all-toolbar">
            <div className="all-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'all'}
                className={`all-tab${tab === 'all' ? ' is-active' : ''}`}
                onClick={() => changeTab('all')}
              >
                All notifications · {notices.length}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'unread'}
                className={`all-tab${tab === 'unread' ? ' is-active' : ''}`}
                onClick={() => changeTab('unread')}
              >
                Unread · {unreadCount}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'read'}
                className={`all-tab${tab === 'read' ? ' is-active' : ''}`}
                onClick={() => changeTab('read')}
              >
                Read · {readCount}
              </button>
            </div>

            <div className="all-tools">
              <label className="all-search">
                <input
                  type="text"
                  placeholder="Search notifications"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </label>

              <select
                className="all-sort"
                value={sort}
                aria-label="Sort notifications"
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  setPage(1);
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="all-table-wrap">
            <table className="all-table">
              <thead>
                <tr>
                  <th>Notification</th>
                  <th>Booking session</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="all-empty">
                      No notifications match your search.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((n) => (
                    <tr key={n.id} className={n.unread ? 'is-unread' : ''}>
                      <td>
                        <div className="all-cell-main">
                          <span className="all-icon">
                            <NoticeIcon type={n.icon} size={14} />
                          </span>
                          <div>
                            <strong className="all-row-title">{n.title}</strong>
                            <span className="all-row-text">{n.text}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="all-session-day">{n.day}</strong>
                        <span className="all-session-time">{n.time}</span>
                      </td>
                      <td className="all-type">{n.type}</td>
                      <td>
                        {n.unread ? (
                          <span className="all-status all-status-unread">
                            <i className="all-dot" />
                            Unread
                          </span>
                        ) : (
                          <span className="all-status all-status-read">Read</span>
                        )}
                      </td>
                      <td>
                        <button type="button" className="all-view" onClick={() => onViewBooking(n.id)}>
                          View booking
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="all-footer">
            <span className="all-showing">
              Showing {from}–{to} of {filtered.length} notifications
            </span>

            <div className="all-pager">
              <button
                type="button"
                className="all-page-btn"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`all-page-num${p === currentPage ? ' is-active' : ''}`}
                  onClick={() => setPage(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="all-page-btn"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <p className="all-note">
          Marking notifications as read won’t change your bookings or dismiss upcoming reminders.
        </p>
      </main>
    </div>
  );
}