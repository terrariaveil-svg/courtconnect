import { useState } from 'react';
import './RemindersPage.css';
import logo from '../assets/courtconnect-logo.png';
import type { Reminder } from './remindersData';
import NoticeIcon from './NoticeIcon';
import { NotifBadge } from './NotifAlerts';

type RemindersPageProps = {
  userName?: string;
  reminders: Reminder[];
  unreadCount: number;
  onViewBooking: () => void;
  onBack: () => void;
  onHome: () => void;
  onOpenProfile?: () => void;
};

type Tab = 'all' | 'due' | 'later';
type Sort = 'soonest' | 'latest';

const PAGE_SIZE = 5;

export default function RemindersPage({
  userName = 'Alex',
  reminders,
  unreadCount,
  onViewBooking,
  onBack,
  onHome,
  onOpenProfile,
}: RemindersPageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('soonest');
  const [page, setPage] = useState(1);

  const dueCount = reminders.filter((r) => r.status === 'due').length;
  const laterCount = reminders.length - dueCount;
  const tip = reminders.find((r) => r.status === 'due' && r.tip)?.tip;

  const q = query.trim().toLowerCase();
  const filtered = reminders
    .filter((r) => {
      if (tab === 'due' && r.status !== 'due') return false;
      if (tab === 'later' && r.status !== 'scheduled') return false;
      if (!q) return true;
      return `${r.title} ${r.text} ${r.withName} ${r.role} ${r.day}`.toLowerCase().includes(q);
    })
    .sort((a, b) => (sort === 'soonest' ? a.order - b.order : b.order - a.order));

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
    <div className="rem-page">
      {/* Top bar */}
      <header className="rem-nav">
        <button type="button" className="rem-brand" onClick={onHome} aria-label="Go to home">
          <img src={logo} alt="" className="rem-logo" />
          <span>PLAYR</span>
        </button>

        <div className="rem-nav-right">
          <label className="rem-nav-search">
            <input type="text" placeholder="Find a Space" />
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </label>

          <span className="alert-wrap">
            <span className="rem-bell" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </span>
            <NotifBadge count={unreadCount} />
          </span>

          <button
            type="button"
            className="rem-avatar"
            onClick={onOpenProfile}
            aria-label="Open user info"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="rem-main">
        <button type="button" className="rem-back" onClick={onBack}>
          ← Notifications &amp; Reminders
        </button>

        <div className="rem-head">
          <div>
            <h1 className="rem-title">Upcoming reminders</h1>
            <p className="rem-subtitle">Plan ahead for your next gym and club reservations.</p>
          </div>

          <span className="rem-pill">
            <i className="rem-dot" />
            {dueCount} due today
          </span>
        </div>

        <section className="rem-card">
          {/* Tabs + search + sort */}
          <div className="rem-toolbar">
            <div className="rem-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'all'}
                className={`rem-tab${tab === 'all' ? ' is-active' : ''}`}
                onClick={() => changeTab('all')}
              >
                All upcoming · {reminders.length}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'due'}
                className={`rem-tab${tab === 'due' ? ' is-active' : ''}`}
                onClick={() => changeTab('due')}
              >
                Due today · {dueCount}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'later'}
                className={`rem-tab${tab === 'later' ? ' is-active' : ''}`}
                onClick={() => changeTab('later')}
              >
                Later · {laterCount}
              </button>
            </div>

            <div className="rem-tools">
              <label className="rem-search">
                <input
                  type="text"
                  placeholder="Search reminders"
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
                className="rem-sort"
                value={sort}
                aria-label="Sort reminders"
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  setPage(1);
                }}
              >
                <option value="soonest">Soonest first</option>
                <option value="latest">Latest first</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rem-table-wrap">
            <table className="rem-table">
              <thead>
                <tr>
                  <th>Reminder &amp; preparation</th>
                  <th>Booking session</th>
                  <th>With</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reminders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="rem-empty">
                      No upcoming reminders. New ones show up here before your bookings.
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="rem-empty">
                      No reminders match your search.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((r) => (
                    <tr key={r.id} className={r.status === 'due' ? 'is-due' : ''}>
                      <td>
                        <div className="rem-cell-main">
                          <span className="rem-icon">
                            <NoticeIcon type="calendar" size={14} />
                          </span>
                          <div>
                            <strong className="rem-row-title">{r.title}</strong>
                            <span className="rem-row-text">{r.text}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="rem-session-day">{r.day}</strong>
                        <span className="rem-session-time">{r.time}</span>
                      </td>
                      <td>
                        <strong className="rem-with-name">{r.withName}</strong>
                        <span className="rem-with-role">{r.role}</span>
                      </td>
                      <td>
                        {r.status === 'due' ? (
                          <span className="rem-status rem-status-due">
                            <i className="rem-dot rem-dot-due" />
                            Due today
                          </span>
                        ) : (
                          <span className="rem-status rem-status-scheduled">
                            <i className="rem-dot" />
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td>
                        <button type="button" className="rem-view" onClick={onViewBooking}>
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
          <div className="rem-footer">
            <span className="rem-showing">
              Showing {from}–{to} of {filtered.length} reminders
            </span>

            <div className="rem-pager">
              <button
                type="button"
                className="rem-page-btn"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`rem-page-num${p === currentPage ? ' is-active' : ''}`}
                  onClick={() => setPage(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="rem-page-btn"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {tip && (
          <div className="rem-tip">
            <span className="rem-tip-icon">
              <NoticeIcon type="calendar" size={16} />
            </span>
            <div>
              <strong>A little early, ready to play.</strong>
              <span>{tip}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}