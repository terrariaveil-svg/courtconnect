import { useCallback, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import HomePage from './components/HomePage';
import UserInfo from './components/UserInfo';
import ClubActivity from './components/ClubActivity';
import NotificationsPage from './components/NotificationsPage';
import AllNotifications from './components/AllNotifications';
import RemindersPage from './components/RemindersPage';
import SpacesShell from './components/SpacesShell';
import SpacesPage from './components/SpacesPage';
import BookingConfirmed from './components/BookingConfirmed';
import MyBookings from './components/MyBookings';
import DiscoverEvents from './components/DiscoverEvents';
import EventDetail from './components/EventDetail';
import { makeEvent, relDay, seedEvents } from './components/eventsList';
import type { ClubEvent, NewEvent } from './components/eventsList';
import type { Booking } from './components/BookingForm';
import type { ApprovalStatus } from './components/approval';
import { findConfirmedBookingConflict } from './components/bookingAvailability';
import type { Facility } from './components/AvailableSpaces';
import { COURTS, GYMS } from './components/spacesData';
import type { SpaceChoice } from './components/QuickBook';
import { INITIAL_NOTICES } from './components/notificationsData';
import type { Notice } from './components/notificationsData';
import { INITIAL_REMINDERS } from './components/remindersData';
import type { Reminder } from './components/remindersData';

type Screen =
  | 'loading'
  | 'login'
  | 'admin'
  | 'home'
  | 'profile'
  | 'activity'
  | 'notifications'
  | 'allnotices'
  | 'reminders'
  | 'spaces'
  | 'confirmed'
  | 'mybookings'
  | 'events'
  | 'event';

function isFacilityList(value: unknown): value is Facility[] {
  return (
    Array.isArray(value) &&
    value.every(
      (court): court is Facility =>
        typeof court === 'object' &&
        court !== null &&
        typeof court.id === 'number' &&
        typeof court.name === 'string' &&
        typeof court.type === 'string' &&
        typeof court.location === 'string' &&
        typeof court.price === 'number' &&
        typeof court.image === 'string' &&
        typeof court.description === 'string',
    )
  );
}

function loadCustomCourts(): { courts: Facility[]; error: string } {
  try {
    const savedCourts = window.localStorage.getItem('courtconnect.customCourts');
    if (!savedCourts) return { courts: [], error: '' };

    const parsed: unknown = JSON.parse(savedCourts);
    if (!isFacilityList(parsed)) {
      throw new Error('Saved court data is invalid.');
    }

    return { courts: parsed, error: '' };
  } catch (error) {
    console.error('Unable to load saved courts.', error);
    return { courts: [], error: 'Saved courts could not be loaded from this device.' };
  }
}

export default function LoginGate() {
  const adminEmail = 'admin@courtconnect.com';
  const adminPassword = 'admin123';
  // The app starts on the loading screen, then goes to the login
  const [screen, setScreen] = useState<Screen>('loading');
  const [loginError, setLoginError] = useState('');
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [toastOpen, setToastOpen] = useState(false);

  // Quick book -> available spaces -> booking
  const [spaceChoice, setSpaceChoice] = useState<SpaceChoice>('court');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [courtStorage, setCourtStorage] = useState(loadCustomCourts);
  const { courts: customCourts, error: courtStorageError } = courtStorage;

  // Events: the list, which one is open, and the spots you reserved (event id -> spots)
  const [events, setEvents] = useState<ClubEvent[]>(() => seedEvents());
  const [eventId, setEventId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Record<number, number>>({});
  const [registrationStatuses, setRegistrationStatuses] = useState<Record<number, ApprovalStatus>>({});

  const unreadCount = notices.filter((n) => n.unread).length;

  const markRead = (id: number) => {
    setNotices((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllRead = () => {
    setNotices((list) => list.map((n) => ({ ...n, unread: false })));
  };

  const dismissReminders = () => {
    setReminders([]);
  };

  const pushNotice = (title: string, text: string, date: string, time: string) => {
    setNotices((list) => [
      {
        id: Math.max(0, ...list.map((n) => n.id)) + 1,
        order: Math.min(0, ...list.map((n) => n.order)) - 1,
        date,
        icon: 'calendar',
        title,
        text,
        day: relDay(date),
        time,
        type: 'Confirmation',
        unread: true,
      },
      ...list,
    ]);
  };

  // Loading screen finished -> login
  const finishLoading = useCallback(() => {
    setScreen('login');
  }, []);

  // Signed in -> home (with the unread pop-up)
  const handleLogin = (email: string, password: string) => {
    if (email.trim().toLowerCase() === adminEmail) {
      if (password !== adminPassword) {
        setLoginError('Incorrect admin password.');
        return;
      }
      setLoginError('');
      setScreen('admin');
      return;
    }

    setLoginError('');
    setToastOpen(true);
    setScreen('home');
  };

  const handleSignOut = () => {
    setLastBooking(null);
    setEventId(null);
    setToastOpen(false);
    setScreen('login');
  };

  // Quick book -> "Show available Space"
  const openSpaces = (choice: SpaceChoice) => {
    setSpaceChoice(choice);
    setScreen('spaces');
  };

  const handleBooked = (booking: Booking) => {
    setBookings((list) => [booking, ...list]);
    setLastBooking(booking);
    setScreen('confirmed');
  };

  const addCourt = (court: Omit<Facility, 'id'>): boolean => {
    const id = Math.max(0, ...COURTS.map((item) => item.id), ...GYMS.map((item) => item.id), ...customCourts.map((item) => item.id)) + 1;
    const nextCourts = [{ ...court, id }, ...customCourts];

    try {
      window.localStorage.setItem('courtconnect.customCourts', JSON.stringify(nextCourts));
    } catch (error) {
      console.error('Unable to save the new court.', error);
      return false;
    }

    setCourtStorage({ courts: nextCourts, error: '' });
    return true;
  };

  const updateBookingStatus = (id: number, status: ApprovalStatus) => {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return;

    if (status === 'Confirmed') {
      const conflict = findConfirmedBookingConflict(booking, bookings);
      if (conflict) {
        window.alert(
          `This court is already booked by ${conflict.customer} from ${conflict.startTime} to ${conflict.endTime}.`,
        );
        return;
      }
    }

    setBookings((list) =>
      list.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    pushNotice(
      `Booking ${status.toLowerCase()}: ${booking.facility.name}`,
      `Your booking request for ${booking.facility.name} was ${status.toLowerCase()}.`,
      booking.date,
      `${booking.startTime}–${booking.endTime}`,
    );
    setToastOpen(true);
  };

  const cancelBooking = (id: number) => {
    setBookings((list) => list.filter((b) => b.id !== id));
  };

  // Events
  const openEvent = (id: number) => {
    setEventId(id);
    setScreen('event');
  };

  const createEvent = (data: NewEvent) => {
    setEvents((list) => [makeEvent(Math.max(0, ...list.map((e) => e.id)) + 1, data), ...list]);
  };

  const registerForEvent = (id: number, spots: number) => {
    setRegistrations((prev) => ({ ...prev, [id]: spots }));
    setRegistrationStatuses((prev) => ({ ...prev, [id]: 'Pending' }));
    const event = events.find((e) => e.id === id);
    if (event) {
      pushNotice(
        `Registration request: ${event.name}`,
        `Your request for ${spots} spot${spots === 1 ? '' : 's'} at ${event.venue} is waiting for admin approval.`,
        event.date,
        event.time,
      );
    }
  };

  const updateRegistrationStatus = (id: number, status: ApprovalStatus) => {
    const event = events.find((item) => item.id === id);
    if (!event) return;

    setRegistrationStatuses((previous) => ({ ...previous, [id]: status }));
    pushNotice(
      `Registration ${status.toLowerCase()}: ${event.name}`,
      `Your registration request for ${event.name} was ${status.toLowerCase()}.`,
      event.date,
      event.time,
    );
    setToastOpen(true);
  };

  const cancelRegistration = (id: number) => {
    setRegistrations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRegistrationStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Props shared by the pages that use the top bar
  const shell = {
    unreadCount,
    bookingCount: bookings.length,
    onHome: () => setScreen('home'),
    onOpenProfile: () => setScreen('profile'),
    onOpenBookings: () => setScreen('mybookings'),
    onOpenSpaces: () => setScreen('spaces'),
    onOpenEvents: () => setScreen('events'),
    onOpenNotifications: () => setScreen('notifications'),
  };

  const currentEvent = events.find((e) => e.id === eventId);

  if (screen === 'loading') {
    return <LoadingScreen onDone={finishLoading} />;
  }

  if (screen === 'login') {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  if (screen === 'admin') {
    return (
      <AdminDashboard
        bookings={bookings}
        courts={customCourts}
        courtStorageError={courtStorageError}
        events={events}
        registrations={registrations}
        registrationStatuses={registrationStatuses}
        onAddCourt={addCourt}
        onBookingStatusChange={updateBookingStatus}
        onRegistrationStatusChange={updateRegistrationStatus}
        onSignOut={handleSignOut}
      />
    );
  }

  if (screen === 'profile') {
    return <UserInfo onHome={() => setScreen('home')} />;
  }

  if (screen === 'activity') {
    return <ClubActivity onHome={() => setScreen('home')} />;
  }

  if (screen === 'spaces') {
    return (
      <SpacesPage
        choice={spaceChoice}
        customCourts={customCourts}
        onChoiceChange={setSpaceChoice}
        onBooked={handleBooked}
        {...shell}
      />
    );
  }

  if (screen === 'event' && currentEvent) {
    return (
      <SpacesShell {...shell} active="events">
        <EventDetail
          key={currentEvent.id}
          event={currentEvent}
          others={events.filter((e) => e.id !== currentEvent.id)}
          tickets={registrations[currentEvent.id] ?? 0}
          registrationStatus={registrationStatuses[currentEvent.id]}
          onBack={() => setScreen('events')}
          onRegister={registerForEvent}
          onCancel={cancelRegistration}
          onOpenEvent={openEvent}
        />
      </SpacesShell>
    );
  }

  if (screen === 'events' || screen === 'event') {
    return (
      <SpacesShell {...shell} active="events">
        <DiscoverEvents
          events={events}
          registrations={registrations}
          onOpenEvent={openEvent}
          onCreate={createEvent}
        />
      </SpacesShell>
    );
  }

  if (screen === 'confirmed' && lastBooking) {
    return (
      <SpacesShell {...shell} active="spaces">
        <BookingConfirmed booking={lastBooking} onDone={() => setScreen('mybookings')} />
      </SpacesShell>
    );
  }

  if (screen === 'mybookings' || screen === 'confirmed') {
    return (
      <SpacesShell {...shell} active="bookings">
        <MyBookings bookings={bookings} onCancel={cancelBooking} />
      </SpacesShell>
    );
  }

  if (screen === 'notifications') {
    return (
      <NotificationsPage
        notices={notices}
        reminders={reminders}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onViewAll={() => setScreen('allnotices')}
        onViewReminders={() => setScreen('reminders')}
        onDismissReminders={dismissReminders}
        onHome={() => setScreen('home')}
        onOpenProfile={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'allnotices') {
    return (
      <AllNotifications
        notices={notices}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        onViewBooking={(id: number) => {
          markRead(id);
          setScreen('home');
        }}
        onBack={() => setScreen('notifications')}
        onHome={() => setScreen('home')}
        onOpenProfile={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'reminders') {
    return (
      <RemindersPage
        reminders={reminders}
        unreadCount={unreadCount}
        onViewBooking={() => setScreen('home')}
        onBack={() => setScreen('notifications')}
        onHome={() => setScreen('home')}
        onOpenProfile={() => setScreen('profile')}
      />
    );
  }

  return (
    <HomePage
      bookings={bookings}
      registeredEvents={events.filter(
        (event) =>
          registrations[event.id] > 0 &&
          registrationStatuses[event.id] === 'Confirmed',
      )}
      unreadCount={unreadCount}
      showUnreadAlert={toastOpen}
      onCloseUnreadAlert={() => setToastOpen(false)}
      onSignOut={handleSignOut}
      onOpenProfile={() => setScreen('profile')}
      onViewDetails={() => setScreen('activity')}
      onOpenNotifications={() => setScreen('notifications')}
      onShowSpaces={openSpaces}
    />
  );
}