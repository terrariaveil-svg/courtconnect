
import { useState, type FormEvent } from "react";
import "./HomePage.css";
import { UnreadToast } from "./NotifAlerts";
import logo from "../assets/courtconnect-logo.png";
import heroImg from "../assets/tennis-court.png";
import QuickBook, { type SpaceChoice } from "./QuickBook";
import type { Booking } from "./BookingForm";
import { timeToMinutes } from "./bookingAvailability";
import type { ApprovalStatus } from "./approval";
import type { ClubEvent } from "./eventsList";

type HomePageProps = {
  userName?: string;
  avatarUrl?: string;
  bookings?: Booking[];
  events?: ClubEvent[];
  eventRegistrations?: Record<number, { spots: number; status: ApprovalStatus }>;
  onSignOut?: () => void;
  onExplore?: () => void;
  onOpenBookings: () => void;
  onEvents?: () => void;
  onOpenProfile: () => void;
  onShowSpaces: (choice: SpaceChoice) => void;
  unreadCount?: number;
  showUnreadAlert?: boolean;
  onCloseUnreadAlert?: () => void;
  onViewDetails?: () => void;
  onOpenNotifications?: () => void;
  onSearch?: (query: string) => void;
};

type UpcomingActivity = {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: string;
};

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const minutesFromMidnight = timeToMinutes(time);
  if (!Number.isFinite(minutesFromMidnight)) return "Time unavailable";

  const date = new Date();
  date.setHours(
    Math.floor(minutesFromMidnight / 60),
    minutesFromMidnight % 60,
    0,
    0,
  );

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getActivityDate(dateValue: string, timeValue?: string) {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  let date: Date;
  if (isoDate) {
    date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
    if (
      date.getFullYear() !== Number(isoDate[1]) ||
      date.getMonth() !== Number(isoDate[2]) - 1 ||
      date.getDate() !== Number(isoDate[3])
    ) {
      return new Date(Number.NaN);
    }
  } else {
    date = new Date(dateValue);
  }

  if (timeValue && !Number.isNaN(date.getTime())) {
    const minutes = timeToMinutes(timeValue);
    if (Number.isFinite(minutes)) {
      date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    }
  }

  return date;
}

export default function HomePage({
  userName = "Alex",
  avatarUrl,
  bookings = [],
  events = [],
  eventRegistrations = {},
  onSignOut,
  onOpenBookings,
  onOpenProfile,
  onShowSpaces,
  onOpenNotifications,
  onSearch,
  unreadCount = 0,
  showUnreadAlert = false,
  onCloseUnreadAlert,
}: HomePageProps) {
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  });
  const now = new Date();
  const hour = now.getHours();
  const displayedDate = getActivityDate(selectedDate);

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  const courtActivities: UpcomingActivity[] = (bookings ?? [])
    .flatMap((booking) => {
      if (booking.status !== "Confirmed") return [];

      const start = timeToMinutes(booking.startTime);
      const end = timeToMinutes(booking.endTime);
      const hasValidTimes =
        Number.isFinite(start) && Number.isFinite(end) && end > start;
      const day = getActivityDate(booking.date);
      if (Number.isNaN(day.getTime())) return [];

      const date = hasValidTimes
        ? getActivityDate(booking.date, booking.startTime)
        : day;
      const endDate = hasValidTimes
        ? getActivityDate(booking.date, booking.endTime)
        : undefined;
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (
        (hasValidTimes && (!endDate || endDate < now)) ||
        (!hasValidTimes && day < today)
      ) {
        return [];
      }

      return [{
        id: `court-${booking.id}`,
        title: booking.facility?.name ?? "Court booking",
        date,
        time: hasValidTimes
          ? `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`
          : "Time unavailable",
        location: booking.facility?.location ?? "CourtConnect Sports Complex",
        type: "Court booking",
      }];
    });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventActivities: UpcomingActivity[] = Object.entries(eventRegistrations)
    .flatMap(([eventId, registration]) => {
      if (registration.status !== "Pending" && registration.status !== "Confirmed") {
        return [];
      }

      const event = events.find((item) => item.id === Number(eventId));
      if (!event) return [];

      const date = getActivityDate(event.date);
      if (Number.isNaN(date.getTime()) || date < today) return [];

      return [{
        id: `event-${event.id}`,
        title: event.name,
        date,
        time: event.time,
        location: [event.venue, event.city].filter(Boolean).join(", "),
        type: registration.status === "Pending"
          ? `${registration.spots} spot${registration.spots === 1 ? "" : "s"} · Pending approval`
          : "Registered event",
      }];
    });

  const upcomingActivities = [...courtActivities, ...eventActivities].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const nextActivity = upcomingActivities[0];

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(searchQuery);
  }

  return (
    <div className="home-page">
      <header className="home-nav">
        <div className="home-nav-brand">
          <img
            src={logo}
            alt="CourtConnect logo"
            className="home-nav-logo"
          />
          <span>PLAYR</span>
        </div>

        <div className="home-nav-right">
          <form className="home-search" role="search" onSubmit={submitSearch}>
            <input
              type="search"
              aria-label="Search spaces by venue, location, or sport"
              placeholder="Find a Space"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="submit" aria-label="Search spaces">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          </form>

          <button
            className="home-bell"
            aria-label="View notifications"
            onClick={onOpenNotifications}
          >
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </button>

          <button
            type="button"
            className="home-avatar"
            onClick={onOpenProfile}
            aria-label="Open profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${userName}'s profile`}
                className="home-avatar-image"
              />
            ) : (
              <span className="home-avatar-fallback">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="home-hero">
        <section className="home-left">
          <p className="home-date-label">
            {WEEKDAYS[displayedDate.getDay()]}, {MONTHS[displayedDate.getMonth()]}
          </p>

          <div className="home-date-boxes">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Choose date"
            />
          </div>

          <h1 className="home-greeting">
            {greeting}, {userName}.
          </h1>

          <p className="home-upnext">Up next</p>

          {nextActivity ? (
            <>
              <h2 className="home-session">
                {nextActivity.title}
              </h2>

              <ul className="home-details">
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                  {formatDate(nextActivity.date)}
                </li>

                <li>
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {nextActivity.time}
                </li>

                <li>
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {nextActivity.location}
                </li>
              </ul>

              <p className="home-upnext">
                {nextActivity.type}
              </p>
            </>
          ) : (
            <h2 className="home-session">No schedule</h2>
          )}

          <div className="home-actions">
            <button
              className="home-btn-details"
              onClick={onOpenBookings}
            >
              My Bookings
            </button>

            <button
              className="home-btn-signout"
              onClick={onSignOut}
            >
              Sign Out
            </button>
          </div>
        </section>

        <section className="home-right">
          <img
            className="home-right-img"
            src={heroImg}
            alt="Aerial view of a tennis court surrounded by trees"
          />
          <button
            className="home-quickbook"
            onClick={() => setQuickBookOpen(true)}
          >
            + Quick book
          </button>
        </section>
      </main>
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
      {quickBookOpen && (
        <QuickBook
          onClose={() => setQuickBookOpen(false)}
          onShowSpaces={(choice) => {
            setQuickBookOpen(false);
            onShowSpaces(choice);
          }}
        />
      )}
    </div>
  );
}
