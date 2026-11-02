import type { ReactNode } from 'react';
import '../App.css'; // his styles for the cards, booking form and My Bookings
import './SpacesShell.css';
import logo from '../assets/courtconnect-logo.png';
import { NotifBadge } from './NotifAlerts';

type SpacesShellProps = {
  userName?: string;
  unreadCount: number;
  bookingCount: number;
  onHome: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  children: ReactNode;
};

export default function SpacesShell({
  userName = 'Alex',
  unreadCount,
  bookingCount,
  onHome,
  onOpenProfile,
  onOpenBookings,
  children,
}: SpacesShellProps) {
  return (
    <div className="sp-page">
      <header className="sp-nav">
        <button type="button" className="sp-brand" onClick={onHome} aria-label="Go to home">
          <img src={logo} alt="" className="sp-logo" />
          <span>PLAYR</span>
        </button>

        <div className="sp-nav-right">
          <button type="button" className="sp-bookings-btn" onClick={onOpenBookings}>
            My bookings
            {bookingCount > 0 && <span className="sp-bookings-count">{bookingCount}</span>}
          </button>

          <span className="alert-wrap">
            <span className="sp-bell" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </span>
            <NotifBadge count={unreadCount} />
          </span>

          <button
            type="button"
            className="sp-avatar"
            onClick={onOpenProfile}
            aria-label="Open user info"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <div className="sp-main">{children}</div>
    </div>
  );
}