import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import './ui.css';
import './AppNav.css';
import logo from '../assets/courtconnect-logo.png';
import type { NavProps } from './appTypes';
import { venueMatches } from './venues';
import { eventMatches } from './eventsData';
import { bookingMatches, fmtLong } from './appUtils';

// The top bar used on the Available Spaces, Events, My Bookings and About pages.
// The links, the search box, the bell and the avatar all work.
export default function AppNav({
  active,
  userName = 'Alex',
  unreadCount,
  venues,
  events,
  bookings,
  onHome,
  onSpaces,
  onEvents,
  onBookings,
  onAbout,
  onNotifications,
  onProfile,
  onPickVenue,
  onPickEvent,
  onPickBooking,
}: NavProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the results when clicking somewhere else
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const q = query.trim();
  const venueHits = q ? venues.filter((v) => venueMatches(v, q)).slice(0, 4) : [];
  const eventHits = q ? events.filter((e) => eventMatches(e, q)).slice(0, 3) : [];
  const bookingHits = q ? bookings.filter((b) => bookingMatches(b, q)).slice(0, 3) : [];
  const hasHits = venueHits.length + eventHits.length + bookingHits.length > 0;

  const pick = (go: () => void) => {
    go();
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key !== 'Enter' || !q) return;
    if (venueHits[0]) pick(() => onPickVenue(venueHits[0].id));
    else if (eventHits[0]) pick(() => onPickEvent(eventHits[0].id));
    else if (bookingHits[0]) pick(() => onPickBooking(bookingHits[0].id));
  };

  const links: { id: NonNullable<NavProps['active']>; label: string; go: () => void }[] = [
    { id: 'spaces', label: 'Available Spaces', go: onSpaces },
    { id: 'events', label: 'Events', go: onEvents },
    { id: 'bookings', label: 'My Bookings', go: onBookings },
    { id: 'about', label: 'About', go: onAbout },
  ];

  return (
    <header className="an-bar">
      <button type="button" className="an-brand" onClick={onHome} aria-label="Go to home">
        <img src={logo} alt="" className="an-logo" />
        <span>PLAYR</span>
      </button>

      <nav className="an-links" aria-label="Main">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            className={`an-link${active === link.id ? ' is-active' : ''}`}
            aria-current={active === link.id ? 'page' : undefined}
            onClick={link.go}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="an-right">
        <div className="an-search" ref={wrapRef}>
          <label className="an-search-field">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search by venue, location or sport..."
              value={query}
              aria-label="Search venues, events and bookings"
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
          </label>

          {open && q && (
            <div className="an-results" role="listbox">
              {!hasHits && <p className="an-none">No results for “{q}”</p>}

              {venueHits.length > 0 && <p className="an-group">Spaces</p>}
              {venueHits.map((v) => (
                <button
                  key={`v-${v.id}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="an-result"
                  onClick={() => pick(() => onPickVenue(v.id))}
                >
                  <strong>{v.name}</strong>
                  <span>
                    {v.sport} · {v.location}
                  </span>
                </button>
              ))}

              {eventHits.length > 0 && <p className="an-group">Events</p>}
              {eventHits.map((ev) => (
                <button
                  key={`e-${ev.id}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="an-result"
                  onClick={() => pick(() => onPickEvent(ev.id))}
                >
                  <strong>{ev.name}</strong>
                  <span>
                    {fmtLong(ev.date)} · {ev.venue}
                  </span>
                </button>
              ))}

              {bookingHits.length > 0 && <p className="an-group">My bookings</p>}
              {bookingHits.map((b) => (
                <button
                  key={`b-${b.id}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="an-result"
                  onClick={() => pick(() => onPickBooking(b.id))}
                >
                  <strong>{b.venueName}</strong>
                  <span>
                    {b.ref} · {fmtLong(b.date)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="an-icon-btn"
          onClick={onNotifications}
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
          {unreadCount > 0 && <span className="an-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>

        <button type="button" className="an-user" onClick={onProfile} aria-label="Open user info">
          <span className="an-avatar">{userName.charAt(0).toUpperCase()}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}