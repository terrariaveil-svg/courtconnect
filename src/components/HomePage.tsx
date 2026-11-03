
import { useState } from "react";
import "./HomePage.css";
import logo from "../assets/courtconnect-logo.png";
import heroImg from "../assets/tennis-court.png";
import QuickBook, { type SpaceChoice } from "./QuickBook";
import type { Booking } from "./BookingForm";
import type { ClubEvent } from "./eventsList";

type HomePageProps = {
  userName?: string;
  bookings?: Booking[];
  registeredEvents?: ClubEvent[];
  onSignOut?: () => void;
  onExplore?: () => void;
  onEvents?: () => void;
  onOpenProfile: () => void;
  onShowSpaces: (choice: SpaceChoice) => void;
  unreadCount?: number;
  showUnreadAlert?: boolean;
  onCloseUnreadAlert?: () => void;
  onViewDetails?: () => void;
  onOpenNotifications?: () => void;
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
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getActivityDate(dateValue: string, timeValue?: string) {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const date = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(dateValue);

  const time = /^(\d{2}):(\d{2})$/.exec(timeValue ?? "");
  if (time && !Number.isNaN(date.getTime())) {
    date.setHours(Number(time[1]), Number(time[2]), 0, 0);
  }

  return date;
}

export default function HomePage({
  userName = "Alex",
  bookings = [],
  registeredEvents = [],
  onSignOut,
  onExplore,
  onOpenProfile,
  onShowSpaces,
  onOpenNotifications,
}: HomePageProps) {
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  });
  const now = new Date();
  const hour = now.getHours();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const displayedDate = getActivityDate(selectedDate);

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  const upcomingActivities: UpcomingActivity[] = [
    ...(bookings ?? []).map((booking) => {
      const date = getActivityDate(booking.date, booking.startTime);

      return {
        id: `court-${booking.id}`,
        title: booking.facility?.name ?? "Court booking",
        date,
        time: `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`,
        location: booking.facility?.location ?? "CourtConnect Sports Complex",
        type: "Court booking",
      };
    }),

    ...(registeredEvents ?? []).map((event) => {
      const date = getActivityDate(event.date);

      return {
        id: `event-${event.id}`,
        title: event.name,
        date,
        time: event.time,
        location: `${event.venue} · ${event.city}`,
        type: "Sports event",
      };
    }),
  ]
    .filter(
      (activity) =>
        !Number.isNaN(activity.date.getTime()) &&
        activity.date >= today
    )
    .sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

  const nextActivity = upcomingActivities[0];

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
          <label className="home-search">
            <input
              type="text"
              placeholder="Find a Space"
              onFocus={onExplore}
            />
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </label>

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
            {userName.charAt(0).toUpperCase()}
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
            <div>
              <h2 className="home-session">
                Nothing scheduled yet
              </h2>
              <p>
                Your upcoming court bookings and event registrations
                will automatically appear here.
              </p>
            </div>
          )}

          <div className="home-actions">
            <button
              className="home-btn-details"
              onClick={onExplore}
            >
              Find a court
            </button>

            <button
              className="home-btn-signout"
              onClick={onSignOut}
            >
              Sign Out
            </button>
          </div>
        </section>

        <section
          className="home-right"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <button
            className="home-quickbook"
            onClick={() => setQuickBookOpen(true)}
          >
            + Quick book
          </button>
        </section>
      </main>
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
