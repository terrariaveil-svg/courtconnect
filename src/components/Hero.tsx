
import { useState } from "react";
import "./HomePage.css";
import logo from "../assets/courtconnect-logo.png";
import heroImg from "../assets/tennis-court.png";
import QuickBook, { type SpaceChoice } from "./QuickBook";
import type { Booking } from "./BookingForm";
import type { SportEvent } from "./Events";

interface HeroProps {
  bookings?: Booking[];
  registeredEvents?: SportEvent[];
  onExplore?: () => void;
  onEvents?: () => void;
  onSignOut?: () => void;
  onOpenProfile: () => void;
  onShowSpaces: (choice: SpaceChoice) => void;
}

export default function Hero({
  bookings = [],
  registeredEvents = [],
  onExplore,
  onEvents,
  onSignOut,
  onOpenProfile,
  onShowSpaces,
}: HeroProps) {
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  const activities = [
    ...bookings.map((booking) => ({
      id: `court-${booking.id}`,
      title: booking.facility?.name ?? "Court booking",
      date: new Date(`${booking.date}T${booking.startTime}:00`),
      time: `${booking.startTime} – ${booking.endTime}`,
      location: booking.facility?.location ?? "CourtConnect Sports Complex",
      type: "Court booking",
    })),

    ...registeredEvents.map((event) => ({
      id: `event-${event.id}`,
      title: event.name,
      date: new Date(event.date),
      time: "Time to be announced",
      location: "CourtConnect Sports Complex",
      type: "Sports event",
    })),
  ]
    .filter(
      (activity) =>
        !Number.isNaN(activity.date.getTime()) &&
        activity.date >= now
    )
    .sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

  const next = activities[0];

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
            aria-label="Events"
            onClick={onEvents}
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
            A
          </button>
        </div>
      </header>

      <main className="home-hero">
        <section className="home-left">
          <p className="home-date-label">
            {now.toLocaleDateString("en-PH", {
              weekday: "long",
              month: "long",
            })}
          </p>

          <div className="home-date-boxes">
            <input readOnly value={String(now.getMonth() + 1).padStart(2, "0")} />
            <input readOnly value={String(now.getDate()).padStart(2, "0")} />
            <input readOnly value={now.getFullYear()} />
          </div>

          <h1 className="home-greeting">
            {greeting}, Alex.
          </h1>

          <p className="home-upnext">Up next</p>

          {next ? (
            <>
              <h2 className="home-session">{next.title}</h2>

              <ul className="home-details">
                <li>
                  <span>📅</span>
                  {next.date.toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </li>
                <li>
                  <span>🕒</span>
                  {next.time}
                </li>
                <li>
                  <span>📍</span>
                  {next.location}
                </li>
              </ul>

              <p className="home-upnext">{next.type}</p>
            </>
          ) : (
            <>
              <h2 className="home-session">
                No upcoming bookings
              </h2>
              <p>
                Your next court booking or event registration
                will automatically appear here.
              </p>
            </>
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
