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
  | 'mybookings';

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

  // Props shared by the pages that use the spaces top bar
  const shell = {
    unreadCount,
    bookingCount: bookings.length,
    onHome: () => setScreen('home'),
    onOpenProfile: () => setScreen('profile'),
    onOpenBookings: () => setScreen('mybookings'),
  };

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

  if (screen === 'confirmed' && lastBooking) {
    return (
      <SpacesShell {...shell}>
        <BookingConfirmed booking={lastBooking} onDone={() => setScreen('mybookings')} />
      </SpacesShell>
    );
  }

  if (screen === 'mybookings' || screen === 'confirmed') {
    return (
      <SpacesShell {...shell}>
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