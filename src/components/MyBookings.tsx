import { useState } from "react";
import "./MyBookings.css";
import type { Booking } from "./BookingForm";

interface Props {
  bookings: Booking[];
  onCancel: (id: number) => void;
}

export default function MyBookings({ bookings, onCancel }: Props) {
  // Which booking is waiting for "are you sure?"
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const totalSpend = bookings
    .filter((booking) => booking.status === "Confirmed")
    .reduce((sum, booking) => sum + booking.facility.price, 0);

  return (
    <div className="mb-page">
      <div className="mb-wrap">
        <span className="mb-eyebrow">Your reservations</span>
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-sub">View your reserved facilities and scheduled playing times.</p>

        {bookings.length > 0 && (
          <div className="mb-summary">
            <div className="mb-stat">
              <span>Total bookings</span>
              <strong>{bookings.length}</strong>
            </div>
            <div className="mb-stat">
              <span>Total price</span>
              <strong>₱{totalSpend}</strong>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mb-empty">
            <span className="mb-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
            </span>
            <h2>No bookings yet</h2>
            <p>When you rent a space, it will show up here.</p>
          </div>
        ) : (
          <ul className="mb-list">
            {bookings.map((booking) => (
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

                  {confirmingId === booking.id ? (
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
      </div>
    </div>
  );
}