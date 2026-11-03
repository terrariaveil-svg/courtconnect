import { useCallback, useState } from 'react';
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
import type { SpaceChoice } from './components/QuickBook';
import { INITIAL_NOTICES } from './components/notificationsData';
import type { Notice } from './components/notificationsData';
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
  | 'confirmed'
  | 'mybookings'
  | 'events'
  | 'event';

export default function LoginGate() {
  // The app starts on the loading screen, then goes to the login
  const [screen, setScreen] = useState<Screen>('loading');
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [toastOpen, setToastOpen] = useState(false);

  // Quick book -> available spaces -> booking
  const [spaceChoice, setSpaceChoice] = useState<SpaceChoice>('court');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  // Events: the list, which one is open, and the spots you reserved (event id -> spots)
  const [events, setEvents] = useState<ClubEvent[]>(() => seedEvents());
  const [eventId, setEventId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Record<number, number>>({});

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

  const pushNotice = (title: string, text: string, day: string, time: string) => {
    setNotices((list) => [
      {
        id: Math.max(0, ...list.map((n) => n.id)) + 1,
        order: Math.min(0, ...list.map((n) => n.order)) - 1,
        icon: 'calendar',
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

  // Loading screen finished -> login
  const finishLoading = useCallback(() => {
    setScreen('login');
  }, []);

  // Signed in -> home (with the unread pop-up)
  const handleLogin = () => {
    setToastOpen(true);
    setScreen('home');
  };

  const handleSignOut = () => {
    setNotices(INITIAL_NOTICES); // reset so everything can be tested again
    setReminders(INITIAL_REMINDERS);
    setBookings([]);
    setLastBooking(null);
    setEvents(seedEvents());
    setRegistrations({});
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
    const event = events.find((e) => e.id === id);
    if (event) {
      pushNotice(
        `Registered: ${event.name}`,
        `You reserved ${spots} spot${spots === 1 ? '' : 's'} for ${event.name} at ${event.venue}.`,
        relDay(event.date),
        event.time,
      );
    }
  };

  const cancelRegistration = (id: number) => {
    setRegistrations((prev) => {
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
  };

  const currentEvent = events.find((e) => e.id === eventId);

  if (screen === 'loading') {
    return <LoadingScreen onDone={finishLoading} />;
  }

  if (screen === 'login') {
    return <Login onLogin={handleLogin} />;
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