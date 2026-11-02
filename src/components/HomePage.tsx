import { useEffect, useState } from 'react';
import './HomePage.css';
import logo from '../assets/courtconnect-logo.png';
import heroImg from '../assets/tennis-court.png';
import { NotifBadge, UnreadToast } from './NotifAlerts';
import QuickBook from './QuickBook';
import type { SpaceChoice } from './QuickBook';

type HomePageProps = {
  userName?: string;
  unreadCount?: number;
  showUnreadAlert?: boolean;
  onCloseUnreadAlert?: () => void;
  onSignOut?: () => void;
  onOpenProfile?: () => void;
  onViewDetails?: () => void;
  onOpenNotifications?: () => void;
  onShowSpaces?: (choice: SpaceChoice) => void;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');
const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const onlyDigits = (value: string, maxLength: number) => value.replace(/\D/g, '').slice(0, maxLength);

export default function HomePage({
  userName = 'Alex',
  unreadCount = 0,
  showUnreadAlert = false,
  onCloseUnreadAlert,
  onSignOut,
  onOpenProfile,
  onViewDetails,
  onOpenNotifications,
  onShowSpaces,
}: HomePageProps) {
  // Real current time (used for the greeting), refreshed every minute
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  // Quick book pop-up
  const [quickOpen, setQuickOpen] = useState(false);

  // Date boxes: start on today's date, and can be edited
  const [monthText, setMonthText] = useState(() => pad(new Date().getMonth() + 1));
  const [dayText, setDayText] = useState(() => pad(new Date().getDate()));
  const [yearText, setYearText] = useState(() => String(new Date().getFullYear()));

  const year = clamp(parseInt(yearText, 10) || now.getFullYear(), 1900, 2100);
  const month = clamp(parseInt(monthText, 10) || 1, 1, 12);
  const day = clamp(parseInt(dayText, 10) || 1, 1, daysInMonth(year, month));
  const selected = new Date(year, month - 1, day);

  // When a box loses focus, tidy up all three (e.g. Feb 31 -> Feb 28)
  const normalize = () => {
    setYearText(String(year));
    setMonthText(pad(month));
    setDayText(pad(day));
  };

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="home-page">
      {/* Top bar */}
      <header className="home-nav">
        <div className="home-nav-brand">
          <img src={logo} alt="CourtConnect logo" className="home-nav-logo" />
          <span>PLAYR</span>
        </div>

        <div className="home-nav-right">
          <label className="home-search">
            <input type="text" placeholder="Find a Space" />
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </label>

          <span className="alert-wrap">
            <button
              type="button"
              className="home-bell"
              onClick={onOpenNotifications}
              aria-label="Open notifications"
            >
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </button>
            <NotifBadge count={unreadCount} />
          </span>

          <button
            type="button"
            className="home-avatar"
            onClick={onOpenProfile}
            aria-label="Open user info"
            style={{ border: 0, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="home-hero">
        <section className="home-left">
          <p className="home-date-label">
            {WEEKDAYS[selected.getDay()]}, {MONTHS[selected.getMonth()]}
          </p>
          <div className="home-date-boxes">
            <input
              inputMode="numeric"
              value={monthText}
              maxLength={2}
              aria-label="Month"
              onChange={(e) => setMonthText(onlyDigits(e.target.value, 2))}
              onBlur={normalize}
            />
            <input
              inputMode="numeric"
              value={dayText}
              maxLength={2}
              aria-label="Day"
              onChange={(e) => setDayText(onlyDigits(e.target.value, 2))}
              onBlur={normalize}
            />
            <input
              inputMode="numeric"
              value={yearText}
              maxLength={4}
              aria-label="Year"
              onChange={(e) => setYearText(onlyDigits(e.target.value, 4))}
              onBlur={normalize}
            />
          </div>

          <h1 className="home-greeting">
            {greeting}, {userName}.
          </h1>

          <p className="home-upnext">Up next</p>
          <h2 className="home-session">Tennis practice</h2>

          <ul className="home-details">
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              Today, 9:30–10:30 AM
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Court 02 · Downtown Club
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
                <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2.2.7 3.5 2.6 3.5 5.5" />
              </svg>
              With Jamie K.
            </li>
          </ul>

          <div className="home-actions">
            <button type="button" className="home-btn-details" onClick={onViewDetails}>
              View details
            </button>
            <button type="button" className="home-btn-signout" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        </section>

        <section className="home-right">
          <img src={heroImg} alt="" className="home-right-img" />
          <button type="button" className="home-quickbook" onClick={() => setQuickOpen(true)}>
            +Quick book
          </button>
        </section>
      </main>

      {/* Unread pop-up */}
      {showUnreadAlert && unreadCount > 0 && (
        <UnreadToast
          count={unreadCount}
          onView={() => {
            onCloseUnreadAlert?.();
            onOpenNotifications?.();
          }}
          onClose={() => onCloseUnreadAlert?.()}
        />
      )}

      {/* Quick book pop-up */}
      {quickOpen && (
        <QuickBook
          onClose={() => setQuickOpen(false)}
          onShowSpaces={(choice) => {
            setQuickOpen(false);
            onShowSpaces?.(choice);
          }}
        />
      )}
    </div>
  );
}