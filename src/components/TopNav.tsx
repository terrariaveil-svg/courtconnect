import './TopNav.css';
import { useState, type FormEvent } from 'react';
import logo from '../assets/courtconnect-logo.png';
import { NotifBadge } from './NotifAlerts';

type TopNavProps = {
  active?: 'spaces' | 'events' | 'bookings';
  userName?: string;
  unreadCount: number;
  bookingCount?: number;
  onHome: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  onOpenSpaces?: () => void;
  onOpenEvents?: () => void;
  onOpenNotifications?: () => void;
  searchValue?: string;
  onSearch?: (query: string) => void;
};

export default function TopNav({
  active,
  userName = 'Alex',
  unreadCount,
  bookingCount = 0,
  onHome,
  onOpenProfile,
  onOpenBookings,
  onOpenSpaces,
  onOpenEvents,
  onOpenNotifications,
  searchValue = '',
  onSearch,
}: TopNavProps) {
  const [query, setQuery] = useState(searchValue);

  const go = (action?: () => void) => () => {
    window.scrollTo(0, 0);
    action?.();
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(query);
  };

  return (
    <header className="tn-bar">
      <button type="button" className="tn-brand" onClick={go(onHome)} aria-label="Go to home">
        <img src={logo} alt="" className="tn-logo" />
        <span>PLAYR</span>
      </button>

      <nav className="tn-links" aria-label="Main">
        <button
          type="button"
          className={`tn-link${active === 'spaces' ? ' is-active' : ''}`}
          onClick={go(onOpenSpaces)}
        >
          Available Spaces
        </button>
        <button
          type="button"
          className={`tn-link${active === 'events' ? ' is-active' : ''}`}
          onClick={go(onOpenEvents)}
        >
          Events
        </button>
        <button
          type="button"
          className={`tn-link${active === 'bookings' ? ' is-active' : ''}`}
          onClick={go(onOpenBookings)}
        >
          My Bookings
          {bookingCount > 0 && <span className="tn-count">{bookingCount}</span>}
        </button>
      </nav>

      <div className="tn-right">
        <form className="tn-search" role="search" onSubmit={submitSearch}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            aria-label="Search spaces by venue, location, or sport"
            placeholder="Search by venue, location or sport..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" aria-label="Search spaces">Search</button>
        </form>

        <button
          type="button"
          className="alert-wrap tn-notifications"
          onClick={go(onOpenNotifications)}
          aria-label={`Open notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <span className="tn-bell" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </span>
          <NotifBadge count={unreadCount} />
        </button>

        <button type="button" className="tn-user" onClick={onOpenProfile} aria-label="Open user info">
          <span className="tn-avatar">{userName.charAt(0).toUpperCase()}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}