import { useState } from "react";
import "./MyBookings.css";
import type { Booking } from "./BookingForm";
import type { ApprovalStatus } from "./approval";

type EventBooking = {
  event: {
    id: number;
    name: string;
    category: string;
    date: string;
    time?: string;
    venue?: string;
    city?: string;
    price: number;
    image: string;
  };
  spots: number;
  status: ApprovalStatus;
};

interface Props {
  bookings: Booking[];
  eventBookings: EventBooking[];
  onCancel: (id: number) => void;
  onCancelEvent: (id: number) => void;
}

export default function MyBookings({
  bookings,
  eventBookings,
  onCancel,
  onCancelEvent,
}: Props) {
  // Which booking is waiting for "are you sure?"
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [confirmingEventId, setConfirmingEventId] = useState<number | null>(null);
  const visibleBookings = bookings.filter((booking) => booking.status !== "Rejected");
  const visibleEventBookings = eventBookings.filter(
    (registration) => registration.status !== "Rejected",
  );
  const totalBookings = visibleBookings.length + visibleEventBookings.length;

  const totalSpend = visibleBookings
    .filter((booking) => booking.status === "Confirmed" || booking.status === "Done")
    .reduce((sum, booking) => sum + booking.facility.price, 0) +
    visibleEventBookings
      .filter((registration) => registration.status === "Confirmed")
      .reduce(
        (sum, registration) =>
          sum + registration.event.price * registration.spots,
        0,
      );

  return (
    <div className="mb-page">
      <div className="mb-wrap">
        <span className="mb-eyebrow">Your reservations and registrations</span>
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-sub">View your facility bookings and event registrations.</p>

        {totalBookings > 0 && (
          <div className="mb-summary">
            <div className="mb-stat">
              <span>Total bookings</span>
              <strong>{totalBookings}</strong>
            </div>
            <div className="mb-stat">
              <span>Total price</span>
              <strong>₱{totalSpend}</strong>
            </div>
          </div>
        )}

        {totalBookings === 0 && (
          <div className="mb-empty">
            <span className="mb-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
            </span>
            <h2>No bookings yet</h2>
            <p>Your facility bookings and event registrations will show up here.</p>
          </div>
        )}
        {visibleBookings.length > 0 && (
          <ul className="mb-list">
            {visibleBookings.map((booking) => (
              <li className="mb-card" key={booking.id}>
                <img src={booking.facility.image} alt="" className="mb-img" />

                <div className="mb-info">
                  <div className="mb-top">
                    <h2>{booking.facility.name}</h2>
                    <span className={`mb-status mb-status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>

                  <ul className="mb-meta">
                    <li>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M3 10h18M8 3v4M16 3v4" />
                      </svg>
                      {booking.date}
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {booking.startTime} – {booking.endTime}
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {booking.facility.location}
                    </li>
                  </ul>

                  <p className="mb-by">Booked by {booking.customer}</p>
                </div>

                <div className="mb-side">
                  <strong className="mb-price">
                    ₱{booking.facility.price}
                    <span> / hour</span>
                  </strong>

                  {booking.status === "Done" ? (
                    <span className="mb-done-note">Booking completed</span>
                  ) : confirmingId === booking.id ? (
                    <div className="mb-confirm" role="alert">
                      <span>Cancel this booking?</span>
                      <div className="mb-confirm-actions">
                        <button
                          type="button"
                          className="mb-btn mb-btn-danger"
                          onClick={() => {
                            onCancel(booking.id);
                            setConfirmingId(null);
                          }}
                        >
                          Yes, cancel
                        </button>
                        <button
                          type="button"
                          className="mb-btn mb-btn-ghost"
                          onClick={() => setConfirmingId(null)}
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mb-btn mb-btn-outline"
                      onClick={() => setConfirmingId(booking.id)}
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {visibleEventBookings.length > 0 && (
          <ul className="mb-list">
            {visibleEventBookings.map(({ event, spots, status }) => (
              <li className="mb-card" key={`event-${event.id}`}>
                <img src={event.image} alt="" className="mb-img" />

                <div className="mb-info">
                  <div className="mb-top">
                    <h2>{event.name}</h2>
                    <span className={`mb-status mb-status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>

                  <ul className="mb-meta">
                    <li>{event.date}</li>
                    {event.time && <li>{event.time}</li>}
                    {(event.venue || event.city) && (
                      <li>{[event.venue, event.city].filter(Boolean).join(" · ")}</li>
                    )}
                    <li>{spots} spot{spots === 1 ? "" : "s"} · {event.category}</li>
                  </ul>

                  <p className="mb-by">Event registration</p>
                </div>

                <div className="mb-side">
                  <strong className="mb-price">
                    ₱{event.price * spots}
                    <span> total</span>
                  </strong>
                  {confirmingEventId === event.id ? (
                    <div className="mb-confirm" role="alert">
                      <span>Cancel this registration?</span>
                      <div className="mb-confirm-actions">
                        <button
                          type="button"
                          className="mb-btn mb-btn-danger"
                          onClick={() => {
                            onCancelEvent(event.id);
                            setConfirmingEventId(null);
                          }}
                        >
                          Yes, cancel
                        </button>
                        <button
                          type="button"
                          className="mb-btn mb-btn-ghost"
                          onClick={() => setConfirmingEventId(null)}
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mb-btn mb-btn-outline"
                      onClick={() => setConfirmingEventId(event.id)}
                    >
                      Cancel registration
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}