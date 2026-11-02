import { useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import './components/ui.css';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import HomePage from './components/HomePage';
import UserInfo from './components/UserInfo';
import ClubActivity from './components/ClubActivity';
import NotificationsPage from './components/NotificationsPage';
import AllNotifications from './components/AllNotifications';
import RemindersPage from './components/RemindersPage';
import VenueDetail from './components/VenueDetail';
import BookCourtPage from './components/BookCourtPage';
import type { BookingDraft, BookingFormData } from './components/BookCourtPage';
import BookingDonePage from './components/BookingDonePage';
import BookingsPage from './components/BookingsPage';
import BookingDetailPage from './components/BookingDetailPage';
import EventsPage from './components/EventsPage';
import type { NewEvent } from './components/EventsPage';
import AboutPage from './components/AboutPage';
import type { SpaceChoice } from './components/QuickBook';
import type { AppBooking, NavActive, NavProps } from './components/appTypes';
import { ALL_VENUES, COURTS, GYMS, courtLabelFor, venueMatches } from './components/venues';
import { eventMatches, seedEvents } from './components/eventsData';
import type { ClubEvent } from './components/eventsData';
import { seedBookings } from './components/seedData';
import {
  bookingMatches,
  fmtLong,
  fmtRange,
  nextRef,
  relDay,
} from './components/appUtils';
import { INITIAL_NOTICES } from './components/notificationsData';
import type { IconKind, Notice } from './components/notificationsData';
import { INITIAL_REMINDERS } from './components/remindersData';
import type { Reminder } from './components/remindersData';

type Screen =
  | 'loading'
  | 'login'
  | 'home'
  | 'profile'
  | 'activity'
  | 'notifications'
  | 'allnotices'
  | 'reminders'
  | 'spaces'
  | 'bookcourt'
  | 'done'
  | 'bookings'
  | 'detail'
  | 'events'
  | 'about';

type Pool = 'all' | 'court' | 'gym';

const USER_NAME = 'Alex';

export default function LoginGate() {
  // The app starts on the loading screen, then goes to the login
  const [screen, setScreen] = useState<Screen>('loading');
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [toastOpen, setToastOpen] = useState(false);

  const [bookings, setBookings] = useState<AppBooking[]>(() => seedBookings());
  const [events, setEvents] = useState<ClubEvent[]>(() => seedEvents());
  const [userEmail, setUserEmail] = useState('alex@example.com');

  const [pool, setPool] = useState<Pool>('all');
  const [venueId, setVenueId] = useState<number | undefined>(undefined);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [lastBooking, setLastBooking] = useState<AppBooking | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [eventFocus, setEventFocus] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const unreadCount = notices.filter((n) => n.unread).length;

  // Hide the small message after a few seconds
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 3200);
    return () => window.clearTimeout(id);
  }, [message]);

  /* ---------- Notifications ---------- */
  const markRead = (id: number) => {
    setNotices((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllRead = () => {
    setNotices((list) => list.map((n) => ({ ...n, unread: false })));
  };

  const dismissReminders = () => {
    setReminders([]);
  };

  const pushNotice = (title: string, text: string, day: string, time: string, icon: IconKind) => {
    setNotices((list) => [
      {
        id: Math.max(0, ...list.map((n) => n.id)) + 1,
        order: Math.min(0, ...list.map((n) => n.order)) - 1,
        icon,
        title,
        text,
        day,
        time,
        type: 'Confirmation',
        unread: true,
      },
      ...list,
    ]);
  };

  /* ---------- Navigation ---------- */
  const goSpaces = (p: Pool = 'all', id?: number) => {
    setPool(p);
    setVenueId(id);
    setScreen('spaces');
  };

  // Quick book -> "Show available Space"
  const openSpaces = (choice: SpaceChoice) => {
    goSpaces(choice === 'gym' ? 'gym' : 'court');
  };

  const openEvents = (focusId: number | null = null) => {
    setEventFocus(focusId);
    setScreen('events');
  };

  const openBookingDetail = (id: number) => {
    setDetailId(id);
    setScreen('detail');
  };

  const nav = (active?: NavActive): NavProps => ({
    active,
    userName: USER_NAME,
    unreadCount,
    venues: ALL_VENUES,
    events,
    bookings,
    onHome: () => setScreen('home'),
    onSpaces: () => goSpaces('all'),
    onEvents: () => openEvents(null),
    onBookings: () => setScreen('bookings'),
    onAbout: () => setScreen('about'),
    onNotifications: () => setScreen('notifications'),
    onProfile: () => setScreen('profile'),
    onPickVenue: (id) => goSpaces('all', id),
    onPickEvent: (id) => openEvents(id),
    onPickBooking: (id) => openBookingDetail(id),
  });

  /* ---------- Sign in / out ---------- */
  const finishLoading = useCallback(() => {
    setScreen('login');
  }, []);

  const handleLogin = (email: string) => {
    if (email) setUserEmail(email);
    setToastOpen(true);
    setScreen('home');
  };

  const handleSignOut = () => {
    setNotices(INITIAL_NOTICES); // reset so everything can be tested again
    setReminders(INITIAL_REMINDERS);
    setBookings(seedBookings());
    setEvents(seedEvents());
    setDraft(null);
    setLastBooking(null);
    setToastOpen(false);
    setScreen('login');
  };

  /* ---------- Bookings ---------- */
  const handleConfirmBooking = (form: BookingFormData) => {
    if (!draft) return;
    const v = draft.venue;

    const booking: AppBooking = {
      id: Date.now(),
      ref: nextRef(bookings),
      venueId: v.id,
      venueName: v.name,
      venueImage: v.image,
      location: v.location,
      sport: v.sport,
      indoor: v.indoor,
      courtLabel: courtLabelFor(v, form.startHour),
      date: form.date,
      startHour: form.startHour,
      endHour: form.endHour,
      pricePerHour: v.price,
      customer: form.customer,
      email: userEmail,
      payment: 'Bank Transfer',
      players: 'Up to 10',
      cancelled: false,
    };

    setBookings((list) => [booking, ...list]);
    setLastBooking(booking);
    pushNotice(
      `${v.name} confirmed`,
      `Your booking at ${v.name} is confirmed. Booking ID ${booking.ref}.`,
      relDay(booking.date),
      fmtRange(booking.startHour, booking.endHour),
      'bell',
    );
    setDraft(null);
    setScreen('done');
  };

  const cancelBooking = (id: number) => {
    const b = bookings.find((x) => x.id === id);
    setBookings((list) => list.map((x) => (x.id === id ? { ...x,