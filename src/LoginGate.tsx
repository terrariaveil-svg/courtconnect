import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
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
import type { CourtRequest, CourtRequestStatus } from './components/courtRequests';
import {
  findConfirmedBookingConflict,
  hasBookingEnded,
} from './components/bookingAvailability';
import type { Facility } from './components/AvailableSpaces';
import type { SpaceChoice } from './components/QuickBook';
import { INITIAL_NOTICES } from './components/notificationsData';
import type { Notice } from './components/notificationsData';
import { INITIAL_REMINDERS } from './components/remindersData';
import type { Reminder } from './components/remindersData';
import { useRecentVisits } from './components/useRecentVisits';
import { loadVisits } from './components/recentVisits';
import type { Visit } from './components/recentVisits';
import { isSupabaseConfigured, requireSupabase, supabase } from './lib/supabase';

type Screen =
  | 'loading'
  | 'login'
  | 'forgot'
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

const CUSTOM_COURTS_KEY = 'courtconnect.customCourts';
const COURT_REQUESTS_KEY = 'courtconnect.courtRequests';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
}

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

function loadCustomCourts(): {
  courts: Facility[];
  error: string;
} {
  try {
    const savedCourts = window.localStorage.getItem(CUSTOM_COURTS_KEY);

    if (!savedCourts) {
      return { courts: [], error: '' };
    }

    const parsed: unknown = JSON.parse(savedCourts);

    if (!isFacilityList(parsed)) {
      throw new Error('Saved court data is invalid.');
    }

    return { courts: parsed, error: '' };
  } catch (error) {
    console.error('Unable to load saved courts.', error);

    return {
      courts: [],
      error: 'Saved courts could not be loaded from this device.',
    };
  }
}

function isCourtRequestList(value: unknown): value is CourtRequest[] {
  return (
    Array.isArray(value) &&
    value.every(
      (request): request is CourtRequest =>
        typeof request === 'object' &&
        request !== null &&
        typeof request.id === 'number' &&
        typeof request.name === 'string' &&
        typeof request.type === 'string' &&
        typeof request.location === 'string' &&
        typeof request.price === 'number' &&
        typeof request.image === 'string' &&
        typeof request.description === 'string' &&
        typeof request.requesterName === 'string' &&
        typeof request.requesterEmail === 'string' &&
        (request.status === 'Pending' ||
          request.status === 'Confirmed' ||
          request.status === 'Rejected'),
    )
  );
}

function loadCourtRequests(): {
  requests: CourtRequest[];
  error: string;
} {
  try {
    const savedRequests = window.localStorage.getItem(COURT_REQUESTS_KEY);

    if (!savedRequests) {
      return { requests: [], error: '' };
    }

    const parsed: unknown = JSON.parse(savedRequests);

    if (!isCourtRequestList(parsed)) {
      throw new Error('Saved court request data is invalid.');
    }

    return { requests: parsed, error: '' };
  } catch (error) {
    console.error('Unable to load saved court requests.', error);

    return {
      requests: [],
      error: 'Court requests could not be loaded from this device.',
    };
  }
}

function visitDate(booking: Booking): Date {
  const withTime = new Date(`${booking.date} ${booking.endTime}`);

  if (!Number.isNaN(withTime.getTime())) {
    return withTime;
  }

  const dayOnly = new Date(booking.date);

  return Number.isNaN(dayOnly.getTime())
    ? new Date()
    : dayOnly;
}

export default function LoginGate() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [loginError, setLoginError] = useState(
    isSupabaseConfigured
      ? ''
      : 'Connect Supabase by setting VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.',
  );
  const [userName, setUserName] = useState('Alex');
  const [userEmail, setUserEmail] = useState('guest');
  const [userId, setUserId] = useState<string | null>(null);
  const [registeredAt, setRegisteredAt] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [toastOpen, setToastOpen] = useState(false);

  const completionNotices = useRef(new Set<number>());
  const activeUserId = useRef<string | null>(null);

  const {
    visits,
    record: recordVisit,
    clear: clearVisits,
    replace: replaceVisits,
  } = useRecentVisits(userEmail);
  const [legacyImportStatus, setLegacyImportStatus] = useState('');

  const [spaceChoice, setSpaceChoice] = useState<SpaceChoice>('court');
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const [courtStorage, setCourtStorage] = useState({
    courts: [] as Facility[],
    error: '',
  });
  const {
    courts: customCourts,
    error: courtStorageError,
  } = courtStorage;
  const [courtRequestStorage, setCourtRequestStorage] = useState({
    requests: [] as CourtRequest[],
    error: '',
  });
  const {
    requests: courtRequests,
    error: courtRequestStorageError,
  } = courtRequestStorage;

  const [events, setEvents] = useState<ClubEvent[]>(() => seedEvents());
  const [eventId, setEventId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Record<number, number>>({});
  const [registrationStatuses, setRegistrationStatuses] =
    useState<Record<number, ApprovalStatus>>({});

  const unreadCount = notices.filter((n) => n.unread).length;

  const persistVisit = useCallback(
    (facility: Facility, visitedAt: Date) => {
      if (!userId) return;
      void requireSupabase()
        .from('recent_visits')
        .upsert(
          {
            user_id: userId,
            facility_id: facility.id,
            name: facility.name,
            type: facility.type,
            image: facility.image,
            visited_at: visitedAt.toISOString(),
          },
          { onConflict: 'user_id,facility_id' },
        )
        .then(({ error }) => {
          if (error) {
            console.error('Unable to save the recent visit to Supabase.', error);
          }
        });
    },
    [userId],
  );

  const loadCloudRecords = useCallback(async (
    account: User,
    onProfileLoaded?: (admin: boolean) => void,
  ) => {
    const client = requireSupabase();
    const profileRequest = client
      .from('profiles')
      .select('full_name, role, address')
      .eq('id', account.id)
      .single();
    const facilityRequest = client
      .from('facilities')
      .select('id, name, type, location, price, image, description')
      .order('id');
    const ownedFacilityRequest = client.rpc('get_my_facility_ids');
    const bookingRequest = client
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false });
    const courtRequestRequest = client
      .from('court_requests')
      .select('*')
      .order('created_at', { ascending: false });
    const eventRequest = client.from('events').select('*').order('event_date');
    const registrationRequest = client.from('event_registrations').select('*');
    const visitRequest = client
      .from('recent_visits')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(10);
    const importRequest = client
      .from('legacy_imports')
      .select('user_id')
      .eq('user_id', account.id)
      .maybeSingle();
    const recordsPromise = Promise.all([
      facilityRequest,
      ownedFacilityRequest,
      bookingRequest,
      courtRequestRequest,
      eventRequest,
      registrationRequest,
      visitRequest,
      importRequest,
    ]).then(
      (results) => ({ results }),
      (error: unknown) => ({ error }),
    );

    const profileResult = await profileRequest;
    if (profileResult.error) throw profileResult.error;
    if (!profileResult.data) {
      throw new Error('Supabase returned incomplete account data.');
    }

    const profile = profileResult.data;
    const isAccountAdmin = profile.role === 'admin';
    setIsAdmin(isAccountAdmin);
    setUserId(account.id);
    setUserName(profile.full_name || account.user_metadata.full_name || 'Member');
    setUserEmail(account.email ?? '');
    setRegisteredAt(account.created_at);
    setUserAddress(profile.address ?? '');
    onProfileLoaded?.(isAccountAdmin);

    const [
      facilityResult,
      ownedFacilityResult,
      bookingResult,
      courtRequestResult,
      eventResult,
      registrationResult,
      visitResult,
      importResult,
    ] = await recordsPromise.then((outcome) => {
      if ('error' in outcome) throw outcome.error;
      return outcome.results;
    });

    const results = [
      facilityResult,
      ownedFacilityResult,
      bookingResult,
      courtRequestResult,
      eventResult,
      registrationResult,
      visitResult,
      importResult,
    ];
    const failedResult = results.find((result) => result.error);
    if (failedResult?.error) throw failedResult.error;
    if (
      !facilityResult.data ||
      !ownedFacilityResult.data ||
      !bookingResult.data ||
      !courtRequestResult.data ||
      !eventResult.data ||
      !registrationResult.data ||
      !visitResult.data
    ) {
      throw new Error('Supabase returned incomplete account data.');
    }

    const facilities = facilityResult.data;
    const ownedFacilityIds = new Set(
      ownedFacilityResult.data.map(
        (row: { facility_id: number | string }) => Number(row.facility_id),
      ),
    );
    const bookingRecords = bookingResult.data;
    const courtRequestRecords = courtRequestResult.data;
    const eventRecords = eventResult.data;
    const registrationRecords = registrationResult.data;
    const visitRecords = visitResult.data;

    setCourtStorage({
      courts: facilities.map((court) => ({
        id: Number(court.id),
        ownerId: ownedFacilityIds.has(Number(court.id)) ? account.id : null,
        name: court.name,
        type: court.type,
        location: court.location,
        price: Number(court.price),
        image: court.image,
        description: court.description,
      })),
      error: '',
    });

    setBookings(
      bookingRecords.map((booking) => ({
        id: Number(booking.id),
        facility: booking.facility as Facility,
        customer: booking.customer,
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status as ApprovalStatus,
      })),
    );

    setCourtRequestStorage({
      requests: courtRequestRecords.map((request) => ({
        id: Number(request.id),
        name: request.name,
        type: request.type,
        location: request.location,
        price: Number(request.price),
        image: request.image,
        description: request.description,
        requesterName: request.requester_name,
        requesterEmail: request.requester_email,
        requesterId: request.requester_id,
        status: request.status as CourtRequestStatus,
      })),
      error: '',
    });

    const loadedEvents = eventRecords.map((event) => ({
      id: Number(event.id),
      name: event.name,
      category: event.category as ClubEvent['category'],
      date: event.event_date,
      time: event.event_time,
      venue: event.venue,
      city: event.city,
      price: Number(event.price),
      capacity: event.capacity,
      spotsLeft: event.spots_left,
      organizer: event.organizer,
      description: event.description,
      image: event.image,
    }));
    const storedEventIds = new Set(loadedEvents.map((event) => event.id));
    setEvents([
      ...loadedEvents,
      ...seedEvents().filter((event) => !storedEventIds.has(event.id)),
    ]);

    const registrationCounts: Record<number, number> = {};
    const statuses: Record<number, ApprovalStatus> = {};
    registrationRecords.forEach((registration) => {
      const eventKey = Number(registration.event_id);
      if (
        registration.status !== 'Rejected' &&
        (!statuses[eventKey] || registration.status === 'Pending')
      ) {
        statuses[eventKey] = registration.status as ApprovalStatus;
      }
      if (registration.status === 'Rejected') return;
      registrationCounts[eventKey] =
        (registrationCounts[eventKey] ?? 0) + registration.spots;
    });
    setRegistrations(registrationCounts);
    setRegistrationStatuses(statuses);

    replaceVisits(
      account.email ?? '',
      visitRecords.map((visit) => ({
        id: Number(visit.facility_id),
        name: visit.name,
        type: visit.type,
        image: visit.image,
        visitedAt: visit.visited_at,
      })),
    );
    setLegacyImportStatus(
      importResult.data ? 'Records from this browser were already imported.' : '',
    );

    return { admin: isAccountAdmin };
  }, [replaceVisits]);

  const activateAccount = useCallback(async (account: User) => {
    if (activeUserId.current === account.id) return;
    activeUserId.current = account.id;
    let accountOpened = false;

    try {
      await loadCloudRecords(account, (admin) => {
        accountOpened = true;
        setLoginError('');
        setToastOpen(true);
        setScreen(admin ? 'admin' : 'home');
      });
    } catch (error) {
      console.error('Unable to load CourtConnect data from Supabase.', error);
      if (accountOpened) return;

      activeUserId.current = null;
      setLoginError(
        error instanceof Error
          ? error.message
          : 'Unable to load your account data from Supabase.',
      );
      setScreen('login');
    }
  }, [loadCloudRecords]);

  const refreshCloudRecords = async () => {
    const { data, error } = await requireSupabase().auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('You are no longer signed in.');
    await loadCloudRecords(data.user);
  };

  const saveProfileAddress = async (address: string) => {
    if (!userId) throw new Error('You are no longer signed in.');

    const { data, error } = await requireSupabase()
      .from('profiles')
      .update({ address })
      .eq('id', userId)
      .select('address')
      .single();
    if (error) throw error;

    setUserAddress(data.address ?? '');
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const client = requireSupabase();
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true);
          setScreen('forgot');
          return;
        }

        if (!session) {
          activeUserId.current = null;
          setUserId(null);
          setIsAdmin(false);
          setUserEmail('guest');
          setScreen((current) => current === 'loading' ? current : 'login');
          return;
        }

        queueMicrotask(() => void activateAccount(session.user));
      },
    );

    return () => subscription.unsubscribe();
  }, [activateAccount]);

  useEffect(() => {
    if (!userId || !supabase) return;

    const client = supabase;
    const channel = client.channel(`courtconnect:${userId}`);
    let refreshTimer: number | undefined;
    let refreshInFlight = false;
    let refreshQueued = false;

    const refreshRecords = () => {
      if (refreshInFlight) {
        refreshQueued = true;
        return;
      }

      refreshInFlight = true;
      void client.auth.getUser()
        .then(async ({ data, error }) => {
          if (error) throw error;
          if (!data.user || data.user.id !== userId) return;
          await loadCloudRecords(data.user);
        })
        .catch((error: unknown) => {
          console.error('Unable to refresh CourtConnect data after a database change.', error);
        })
        .finally(() => {
          refreshInFlight = false;
          if (refreshQueued) {
            refreshQueued = false;
            refreshRecords();
          }
        });
    };

    const scheduleRefresh = () => {
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(refreshRecords, 100);
    };

    const refreshInterval = window.setInterval(refreshRecords, 15_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshRecords();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);

    const subscribeToTable = (table: string, filter?: string) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        scheduleRefresh,
      );
    };

    subscribeToTable('profiles', `id=eq.${userId}`);
    subscribeToTable('facilities');
    subscribeToTable('bookings', isAdmin ? undefined : `user_id=eq.${userId}`);
    subscribeToTable(
      'court_requests',
      isAdmin ? undefined : `requester_id=eq.${userId}`,
    );
    subscribeToTable('events');
    subscribeToTable(
      'event_registrations',
      isAdmin ? undefined : `user_id=eq.${userId}`,
    );
    subscribeToTable('recent_visits', `user_id=eq.${userId}`);
    subscribeToTable('legacy_imports', `user_id=eq.${userId}`);

    channel.subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('CourtConnect live updates could not connect.', error ?? status);
      }
    });

    return () => {
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      void client.removeChannel(channel);
    };
  }, [isAdmin, loadCloudRecords, userId]);

  const markRead = (id: number) => {
    setNotices((list) =>
      list.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const markAllRead = () => {
    setNotices((list) =>
      list.map((n) => ({ ...n, unread: false })),
    );
  };

  const dismissReminders = () => {
    setReminders([]);
  };

  const pushNotice = useCallback(
    (title: string, text: string, date: string, time: string) => {
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
    },
    [],
  );

  useEffect(() => {
    const completeExpiredBookings = () => {
      const now = new Date();

      const expiredBookings = bookings.filter(
        (booking) =>
          booking.status === 'Confirmed' &&
          !completionNotices.current.has(booking.id) &&
          hasBookingEnded(booking, now),
      );

      if (expiredBookings.length === 0) return;

      expiredBookings.forEach((booking) =>
        completionNotices.current.add(booking.id),
      );

      const expiredIds = new Set(
        expiredBookings.map((booking) => booking.id),
      );

      setBookings((current) =>
        current.map((booking) =>
          expiredIds.has(booking.id) && booking.status === 'Confirmed'
            ? { ...booking, status: 'Done' }
            : booking,
        ),
      );

      expiredBookings.forEach((booking) => {
        const visitedAt = visitDate(booking);
        recordVisit(booking.facility, visitedAt);
        persistVisit(booking.facility, visitedAt);
        void requireSupabase()
          .from('bookings')
          .update({ status: 'Done' })
          .eq('id', booking.id)
          .then(({ error }) => {
            if (error) {
              console.error('Unable to mark the completed booking in Supabase.', error);
            }
          });

        pushNotice(
          `Booking completed: ${booking.facility.name}`,
          `Your booking for ${booking.facility.name} has ended and is marked done.`,
          booking.date,
          `${booking.startTime}–${booking.endTime}`,
        );
      });

      setToastOpen(true);
    };

    completeExpiredBookings();

    const intervalId = window.setInterval(
      completeExpiredBookings,
      15_000,
    );

    return () => window.clearInterval(intervalId);
  }, [bookings, persistVisit, pushNotice, recordVisit]);

  const finishLoading = useCallback(() => {
    setScreen('login');
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginError('');
      const { error } = await requireSupabase().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Unable to sign in with Supabase.', error);
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  };

  const handleCreateAccount = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      setLoginError('');
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      if (!data.session) {
        setLoginError('Account created. Check your email to confirm it, then sign in.');
      }
    } catch (error) {
      console.error('Unable to create the Supabase account.', error);
      setLoginError(error instanceof Error ? error.message : 'Unable to create your account.');
    }
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin },
    );
    if (error) throw error;
  };

  const resetPassword = async (password: string) => {
    const { error } = await requireSupabase().auth.updateUser({ password });
    if (error) throw error;
    setRecoveryMode(false);
    setScreen('login');
    await requireSupabase().auth.signOut();
  };

  const handleSignOut = async () => {
    try {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Unable to sign out of Supabase.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
      return;
    }

    setLastBooking(null);
    setEventId(null);
    setToastOpen(false);
    setSelectedVisitId(null);
    setBookings([]);
    setCourtStorage({ courts: [], error: '' });
    setCourtRequestStorage({ requests: [], error: '' });
    setEvents(seedEvents());
    setRegistrations({});
    setRegistrationStatuses({});
    setScreen('login');
  };

  const openSpaces = (choice: SpaceChoice) => {
    setSpaceChoice(choice);
    setSelectedVisitId(null);
    setScreen('spaces');
  };

  // Open the exact facility selected in Recent Visited.
  const openVisit = (visit: Visit) => {
    setSelectedVisitId(visit.id);
    setSpaceChoice(
      visit.type === 'Gym floor' ? 'gym' : 'court',
    );
    setScreen('spaces');
  };

  const handleFacilityViewed = (facility: Facility) => {
    const visitedAt = new Date();
    recordVisit(facility, visitedAt);
    persistVisit(facility, visitedAt);
  };

  const clearRecentVisits = async () => {
    if (!userId) return;

    try {
      const { error } = await requireSupabase()
        .from('recent_visits')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
      clearVisits();
    } catch (error) {
      console.error('Unable to clear recent visits from Supabase.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to clear recent visits.');
    }
  };

  const importLegacyRecords = async () => {
    if (!userId) return;

    try {
      const client = requireSupabase();
      const { data: existingImport, error: existingError } = await client
        .from('legacy_imports')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existingImport) {
        setLegacyImportStatus('Records from this browser were already imported.');
        return;
      }

      const localCourts = loadCustomCourts();
      const localRequests = loadCourtRequests();
      if (localCourts.error) throw new Error(localCourts.error);
      if (localRequests.error) throw new Error(localRequests.error);

      const importedCourtKeys = new Set(
        localCourts.courts.map(
          (court) => `${court.name.trim().toLowerCase()}|${court.location.trim().toLowerCase()}`,
        ),
      );
      const requestsToImport = localRequests.requests.filter((request) => {
        const ownedByCurrentUser =
          request.requesterEmail.toLowerCase() === userEmail.toLowerCase();
        const courtAlreadyImported =
          isAdmin &&
          request.status === 'Confirmed' &&
          importedCourtKeys.has(
            `${request.name.trim().toLowerCase()}|${request.location.trim().toLowerCase()}`,
          );
        return ownedByCurrentUser && !courtAlreadyImported;
      });
      if (isAdmin && localCourts.courts.length > 0) {
        const { error } = await client.from('facilities').insert(
          localCourts.courts.map(({ name, type, location, price, image, description }) => ({
            name,
            type,
            location,
            price,
            image,
            description,
          })),
        );
        if (error) throw error;
      }

      if (requestsToImport.length > 0) {
        const { error } = await client.from('court_requests').insert(
          requestsToImport.map((request) => ({
            requester_id: userId,
            requester_name: userName,
            requester_email: userEmail,
            name: request.name,
            type: request.type,
            location: request.location,
            price: request.price,
            image: request.image,
            description: request.description,
            status: 'Pending',
          })),
        );
        if (error) throw error;
      }

      const localVisits = loadVisits(userEmail);
      if (localVisits.length > 0) {
        const { error } = await client.from('recent_visits').upsert(
          localVisits.map((visit) => ({
            user_id: userId,
            facility_id: visit.id,
            name: visit.name,
            type: visit.type,
            image: visit.image,
            visited_at: visit.visitedAt,
          })),
          { onConflict: 'user_id,facility_id' },
        );
        if (error) throw error;
      }

      const { error: markError } = await client
        .from('legacy_imports')
        .insert({ user_id: userId });
      if (markError) throw markError;

      const { data: sessionData, error: sessionError } =
        await client.auth.getUser();
      if (sessionError) throw sessionError;
      if (!sessionData.user) throw new Error('You are no longer signed in.');
      await loadCloudRecords(sessionData.user);

      setLegacyImportStatus(
        `Imported ${requestsToImport.length} court request(s) and ${localVisits.length} recent visit(s).`,
      );
    } catch (error) {
      console.error('Unable to import legacy browser records.', error);
      setLegacyImportStatus(
        error instanceof Error ? error.message : 'Unable to import browser records.',
      );
    }
  };

  const handleBooked = async (booking: Booking) => {
    if (!userId) throw new Error('You are no longer signed in.');

    try {
      const requestedFacility = { ...booking.facility };
      delete requestedFacility.ownerId;
      const { data, error } = await requireSupabase().rpc('create_booking', {
        requested_facility: requestedFacility,
        requested_customer: booking.customer,
        requested_date: booking.date,
        requested_start_time: booking.startTime,
        requested_end_time: booking.endTime,
      });
      if (error) throw error;

      const savedBooking = { ...booking, id: Number(data) };
      setBookings((list) => [savedBooking, ...list]);
      setLastBooking(savedBooking);
      setScreen('confirmed');
    } catch (error) {
      console.error('Unable to save the booking to Supabase.', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        throw new Error(error.message, { cause: error });
      }
      throw new Error(
        error instanceof Error ? error.message : 'Unable to save your booking.',
        { cause: error },
      );
    }
  };

  const addCourt = async (court: Omit<Facility, 'id'>): Promise<boolean> => {
    try {
      const { data, error } = await requireSupabase()
        .from('facilities')
        .insert(court)
        .select('id')
        .single();
      if (error) throw error;

      setCourtStorage((current) => ({
        ...current,
        courts: [{ ...court, id: Number(data.id) }, ...current.courts],
      }));
      return true;
    } catch (error) {
      console.error('Unable to save the court to Supabase.', error);
      return false;
    }
  };

  const deleteCourt = async (id: number): Promise<boolean> => {
    try {
      const { data, error } = await requireSupabase()
        .from('facilities')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('You can only delete courts you own.');

      setCourtStorage((current) => ({
        ...current,
        courts: current.courts.filter((court) => court.id !== id),
      }));
      return true;
    } catch (error) {
      console.error('Unable to delete the court from Supabase.', error);
      return false;
    }
  };

  const updateCourt = async (
    court: Facility,
  ): Promise<void> => {
    const updates = {
      name: court.name,
      type: court.type,
      location: court.location,
      price: court.price,
      image: court.image,
      description: court.description,
    };
    const { data, error } = await requireSupabase()
      .from('facilities')
      .update(updates)
      .eq('id', court.id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('You can only edit courts you own.');

    setCourtStorage((current) => ({
      ...current,
      courts: current.courts.map((item) =>
        item.id === court.id ? { ...item, ...updates } : item,
      ),
    }));
  };

  const requestCourt = async (
    court: Omit<Facility, 'id'>,
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await requireSupabase()
        .from('court_requests')
        .insert({
          ...court,
          requester_id: userId,
          requester_name: userName,
          requester_email: userEmail,
        })
        .select('id')
        .single();
      if (error) throw error;

      setCourtRequestStorage((current) => ({
        ...current,
        requests: [
          {
            ...court,
            id: Number(data.id),
            requesterName: userName,
            requesterEmail: userEmail,
            requesterId: userId,
            status: 'Pending',
          },
          ...current.requests,
        ],
      }));
      return true;
    } catch (error) {
      console.error('Unable to save the court request to Supabase.', error);
      return false;
    }
  };

  const updateCourtRequestStatus = async (
    id: number,
    status: CourtRequestStatus,
  ): Promise<boolean> => {
    const request = courtRequests.find((item) => item.id === id);
    if (!request || status === 'Pending') return false;

    try {
      const { data, error } = await requireSupabase().rpc(
        'review_court_request',
        { request_id: id, new_status: status },
      );
      if (error) throw error;

      setCourtRequestStorage((current) => ({
        ...current,
        requests: current.requests.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
      }));

      if (status === 'Confirmed' && data !== null) {
        setCourtStorage((current) => ({
          ...current,
          courts: [{
            ...request,
            id: Number(data),
            ownerId: request.requesterId ?? null,
          }, ...current.courts],
        }));
      }

      return true;
    } catch (error) {
      console.error('Unable to review the court request in Supabase.', error);
      return false;
    }
  };

  const updateBookingStatus = (
    id: number,
    status: ApprovalStatus,
  ) => {
    const booking = bookings.find((item) => item.id === id);

    if (!booking) return;

    if (status === 'Confirmed') {
      const conflict = findConfirmedBookingConflict(
        booking,
        bookings,
      );

      if (conflict) {
        window.alert(
          `This court is already booked by ${conflict.customer} from ${conflict.startTime} to ${conflict.endTime}.`,
        );
        return;
      }
    }

    void (async () => {
      try {
        const { error } = await requireSupabase()
          .from('bookings')
          .update({ status })
          .eq('id', id);
        if (error) throw error;

        setBookings((list) =>
          list.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        );

        if (status === 'Done') {
          const visitedAt = visitDate(booking);
          recordVisit(booking.facility, visitedAt);
          persistVisit(booking.facility, visitedAt);
        }

        pushNotice(
          `Booking ${status.toLowerCase()}: ${booking.facility.name}`,
          `Your booking request for ${booking.facility.name} was ${status.toLowerCase()}.`,
          booking.date,
          `${booking.startTime}–${booking.endTime}`,
        );

        setToastOpen(true);
      } catch (error) {
        console.error('Unable to update the booking in Supabase.', error);
        window.alert(error instanceof Error ? error.message : 'Unable to update the booking.');
      }
    })();
  };

  // Cancelling a booking does not count as visiting a facility.
  const cancelBooking = (id: number) => {
    void (async () => {
      try {
        const { error } = await requireSupabase()
          .from('bookings')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setBookings((list) => list.filter((booking) => booking.id !== id));
      } catch (error) {
        console.error('Unable to cancel the booking in Supabase.', error);
        window.alert(error instanceof Error ? error.message : 'Unable to cancel the booking.');
      }
    })();
  };

  const openEvent = (id: number) => {
    setEventId(id);
    setScreen('event');
  };

  const createEvent = (data: NewEvent) => {
    void (async () => {
      if (!userId) return;

      const event = makeEvent(Date.now(), data);
      try {
        const { data: saved, error } = await requireSupabase()
          .from('events')
          .insert({
            name: event.name,
            category: event.category,
            event_date: event.date,
            event_time: event.time,
            venue: event.venue,
            city: event.city,
            price: event.price,
            capacity: event.capacity,
            spots_left: event.spotsLeft,
            organizer: event.organizer,
            description: event.description,
            image: event.image,
            created_by: userId,
          })
          .select('id')
          .single();
        if (error) throw error;

        setEvents((list) => [{ ...event, id: Number(saved.id) }, ...list]);
      } catch (error) {
        console.error('Unable to save the event to Supabase.', error);
        window.alert(error instanceof Error ? error.message : 'Unable to create the event.');
      }
    })();
  };

  const registerForEvent = (id: number, spots: number) => {
    void (async () => {
      try {
        const { error } = await requireSupabase().rpc('register_for_event', {
          requested_event_id: id,
          requested_spots: spots,
        });
        if (error) throw error;

        setRegistrations((previous) => ({ ...previous, [id]: spots }));
        setRegistrationStatuses((previous) => ({ ...previous, [id]: 'Pending' }));

        const event = events.find((item) => item.id === id);
        if (event) {
          setEvents((list) =>
            list.map((item) =>
              item.id === id
                ? { ...item, spotsLeft: Math.max(0, item.spotsLeft - spots) }
                : item,
            ),
          );
          pushNotice(
            `Registration request: ${event.name}`,
            `Your request for ${spots} spot${spots === 1 ? '' : 's'} at ${event.venue} is waiting for admin approval.`,
            event.date,
            event.time,
          );
        }
      } catch (error) {
        console.error('Unable to save the event registration to Supabase.', error);
        window.alert(
          getErrorMessage(error, 'Unable to register for the event.'),
        );
      }
    })();
  };

  const updateRegistrationStatus = (
    id: number,
    status: ApprovalStatus,
  ) => {
    const event = events.find((item) => item.id === id);

    if (!event) return;

    void (async () => {
      try {
        const { data, error } = await requireSupabase()
          .from('event_registrations')
          .select('id')
          .eq('event_id', id)
          .eq('status', 'Pending');
        if (error) throw error;

        for (const registration of data) {
          const result = await requireSupabase().rpc('review_event_registration', {
            registration_id: registration.id,
            new_status: status,
          });
          if (result.error) throw result.error;
        }

        setRegistrationStatuses((previous) => ({ ...previous, [id]: status }));
        if (status === 'Rejected') {
          setEvents((list) =>
            list.map((item) =>
              item.id === id
                ? { ...item, spotsLeft: Math.min(item.capacity, item.spotsLeft + (registrations[id] ?? 0)) }
                : item,
            ),
          );
        }
        pushNotice(
          `Registration ${status.toLowerCase()}: ${event.name}`,
          `Your registration request for ${event.name} was ${status.toLowerCase()}.`,
          event.date,
          event.time,
        );
        setToastOpen(true);
      } catch (error) {
        console.error('Unable to update the registration in Supabase.', error);
        window.alert(error instanceof Error ? error.message : 'Unable to update the registration.');
      }
    })();
  };

  const cancelRegistration = (id: number) => {
    void (async () => {
      try {
        const { data, error } = await requireSupabase()
          .from('event_registrations')
          .select('id, spots')
          .eq('event_id', id)
          .eq('user_id', userId)
          .eq('status', 'Pending')
          .single();
        if (error) throw error;

        const result = await requireSupabase().rpc('cancel_event_registration', {
          registration_id: data.id,
        });
        if (result.error) throw result.error;

        setRegistrations((previous) => {
          const next = { ...previous };
          delete next[id];
          return next;
        });
        setRegistrationStatuses((previous) => {
          const next = { ...previous };
          delete next[id];
          return next;
        });
        setEvents((list) =>
          list.map((event) =>
            event.id === id
              ? { ...event, spotsLeft: Math.min(event.capacity, event.spotsLeft + data.spots) }
              : event,
          ),
        );
      } catch (error) {
        console.error('Unable to cancel the registration in Supabase.', error);
        window.alert(error instanceof Error ? error.message : 'Unable to cancel the registration.');
      }
    })();
  };

  const shell = {
    userName,
    unreadCount,
    bookingCount: bookings.length,
    onHome: () => setScreen('home'),
    onOpenProfile: () => setScreen('profile'),
    onOpenBookings: () => setScreen('mybookings'),
    onOpenSpaces: () => setScreen('spaces'),
    onOpenEvents: () => setScreen('events'),
    onOpenNotifications: () => setScreen('notifications'),
  };

  const currentEvent = events.find(
    (event) => event.id === eventId,
  );

  if (screen === 'loading') {
    return <LoadingScreen onDone={finishLoading} />;
  }

  if (screen === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onCreateAccount={handleCreateAccount}
        onForgotPassword={() => {
          setLoginError('');
          setRecoveryMode(false);
          setScreen('forgot');
        }}
        error={loginError}
      />
    );
  }

  if (screen === 'forgot') {
    return (
      <ForgotPassword
        recoveryMode={recoveryMode}
        onRequestReset={requestPasswordReset}
        onResetPassword={resetPassword}
        onBack={() => {
          setRecoveryMode(false);
          setLoginError('');
          setScreen('login');
        }}
      />
    );
  }

  if (screen === 'admin') {
    return (
      <AdminDashboard
        bookings={bookings}
        courts={customCourts}
        courtRequests={courtRequests}
        courtStorageError={courtStorageError}
        courtRequestStorageError={courtRequestStorageError}
        events={events}
        registrations={registrations}
        registrationStatuses={registrationStatuses}
        onAddCourt={addCourt}
        onDeleteCourt={deleteCourt}
        onCourtRequestStatusChange={updateCourtRequestStatus}
        onRefreshData={refreshCloudRecords}
        onImportLegacy={importLegacyRecords}
        importStatus={legacyImportStatus}
        onBookingStatusChange={updateBookingStatus}
        onRegistrationStatusChange={updateRegistrationStatus}
        onSignOut={handleSignOut}
      />
    );
  }

  if (screen === 'profile') {
    return (
      <UserInfo
        userName={userName}
        registeredAt={registeredAt}
        address={userAddress}
        visits={visits}
        bookings={bookings}
        onSaveAddress={saveProfileAddress}
        courts={customCourts.filter((court) => court.ownerId === userId)}
        onUpdateCourt={updateCourt}
        onDeleteCourt={deleteCourt}
        onClearVisits={clearRecentVisits}
        onOpenVisit={openVisit}
        onExplore={() => openSpaces('court')}
        onImportLegacy={importLegacyRecords}
        importStatus={legacyImportStatus}
        onHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'activity') {
    return (
      <ClubActivity
        onHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'spaces') {
    return (
      <SpacesPage
        choice={spaceChoice}
        customCourts={customCourts}
        courtRequests={courtRequests.filter(
          (request) => request.requesterEmail === userEmail,
        )}
        courtRequestStorageError={courtRequestStorageError}
        initialFacilityId={selectedVisitId}
        onFacilityViewed={handleFacilityViewed}
        onRequestCourt={requestCourt}
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
          others={events.filter(
            (event) => event.id !== currentEvent.id,
          )}
          tickets={registrations[currentEvent.id] ?? 0}
          registrationStatus={
            registrationStatuses[currentEvent.id]
          }
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
        <BookingConfirmed
          booking={lastBooking}
          onDone={() => {
            recordVisit(
              lastBooking.facility,
              visitDate(lastBooking),
            );
            setScreen('mybookings');
          }}
        />
      </SpacesShell>
    );
  }

  if (screen === 'mybookings' || screen === 'confirmed') {
    return (
      <SpacesShell {...shell} active="bookings">
        <MyBookings
          bookings={bookings}
          onCancel={cancelBooking}
        />
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
      userName={userName}
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