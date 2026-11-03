import "./BookingConfirmed.css";
import type { Booking } from "./BookingForm";

interface Props {
  booking: Booking;
  onDone: () => void;
}

export default function BookingConfirmed({ booking, onDone }: Props) {
  const reference = `CC-${String(booking.id).slice(-6)}`;

  const rows = [
    { label: "Date", value: booking.date },
    { label: "Time", value: `${booking.startTime} – ${booking.endTime}` },
    { label: "Location", value: booking.facility.location },
    { label: "Booked by", value: booking.customer },
  ];

  return (
    <div className="bc-page">
      <section className="bc-card" aria-live="polite">
        <div className="bc-check" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="34"
            height="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.500" />
          </svg>
        </div>

        <span className="bc-eyebrow">
          {booking.status === "Pending"
            ? "Request submitted"
            : booking.status === "Done"
              ? "Booking completed"
              : `Booking ${booking.status.toLowerCase()}`}
        </span>
        <h1 className="bc-title">
          {booking.status === "Pending"
            ? "Waiting for admin approval"
            : booking.status === "Confirmed"
              ? "Your space is reserved!"
              : booking.status === "Done"
                ? "Your booking is complete"
              : "Booking request declined"}
        </h1>
        <p className="bc-sub">
          {booking.status === "Pending"
            ? "Your booking request was sent to the admin. Check My Bookings for its status."
            : booking.status === "Confirmed"
              ? "Your booking is approved. Show this reference when you arrive."
              : booking.status === "Done"
                ? "Your scheduled booking has ended and has been marked done."
              : "Your booking request was not approved. You can make another request."}
        </p>

        <div className="bc-ref">
          <span>Reference</span>
          <strong>{reference}</strong>
        </div>

        <div className="bc-facility">
          <img src={booking.facility.image} alt="" className="bc-facility-img" />
          <div>
            <strong>{booking.facility.name}</strong>
            <span>{booking.facility.type}</span>
          </div>
          <span className="bc-status">{booking.status}</span>
        </div>

        <dl className="bc-details">
          {rows.map((row) => (
            <div className="bc-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
          <div className="bc-row bc-total">
            <dt>Total</dt>
            <dd>₱{booking.facility.price}</dd>
          </div>
        </dl>

        <button type="button" className="bc-button" onClick={onDone}>
          View My Bookings
        </button>
      </section>
    </div>
  );
}