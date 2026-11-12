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
  searchValue?: string;
  onSearch?: (query: string) => void;
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
  searchValue,
  onSearch,
  children,
}: SpacesShellProps) {
  return (
    <div className="sp-page">
      <TopNav
        key={searchValue}
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
        searchValue={searchValue}
        onSearch={onSearch}
      />

      <div className="sp-main">{children}</div>
    </div>
  );
}