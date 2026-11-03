import type { ReactNode } from 'react';
import '../App.css'; // his styles for the cards, booking form and My Bookings
import './SpacesShell.css';
import TopNav from './TopNav';

type SpacesShellProps = {
  active?: 'spaces' | 'events' | 'bookings';
  userName?: string;
  unreadCount: number;
  bookingCount: number;
  onHome: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  onOpenSpaces?: () => void;
  onOpenEvents?: () => void;
  onOpenNotifications: () => void;
  children: ReactNode;
};

export default function SpacesShell({
  active,
  userName,
  unreadCount,
  bookingCount,
  onHome,
  onOpenProfile,
  onOpenBookings,
  onOpenSpaces,
  onOpenEvents,
  onOpenNotifications,
  children,
}: SpacesShellProps) {
  return (
    <div className="sp-page">
      <TopNav
        active={active}
        userName={userName}
        unreadCount={unreadCount}
        bookingCount={bookingCount}
        onHome={onHome}
        onOpenProfile={onOpenProfile}
        onOpenBookings={onOpenBookings}
        onOpenSpaces={onOpenSpaces}
        onOpenEvents={onOpenEvents}
        onOpenNotifications={onOpenNotifications}
      />

      <div className="sp-main">{children}</div>
    </div>
  );
}