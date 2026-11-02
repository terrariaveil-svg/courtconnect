import type { Venue } from './venues';
import type { ClubEvent } from './eventsData';

export type DisplayStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export type AppBooking = {
  id: number;
  ref: string; // e.g. CC-2026-0012
  venueId: number;
  venueName: string;
  venueImage: string;
  location: string;
  sport: string;
  indoor: boolean;
  courtLabel: string; // e.g. Court 03
  date: string; // ISO yyyy-mm-dd
  startHour: number; // 0-23
  endHour: number; // 0-23
  pricePerHour: number;
  customer: string;
  email: string;
  payment: string;
  players: string;
  cancelled: boolean;
};

export type NavActive = 'spaces' | 'events' | 'bookings' | 'about';

// Everything the top bar needs to be fully functional
export type NavProps = {
  active?: NavActive;
  userName?: string;
  unreadCount: number;
  venues: Venue[];
  events: ClubEvent[];
  bookings: AppBooking[];
  onHome: () => void;
  onSpaces: () => void;
  onEvents: () => void;
  onBookings: () => void;
  onAbout: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onPickVenue: (id: number) => void;
  onPickEvent: (id: number) => void;
  onPickBooking: (id: number) => void;
};