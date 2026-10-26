
import { CalendarDays, Clock, MapPin, Trash2 } from "lucide-react";
import type { Booking } from "./BookingForm";

interface Props {
  booking: Booking;
  onCancel: (id: number) => void;
}

export default function BookingDetails({ booking, onCancel }: Props) {
  return (
    <article className="booking-card">
      <img
        className="booking-thumbnail"
        src={booking.facility.image}
        alt={booking.facility.name}
      />

      <div className="booking-info">
        <div className="booking-title-row">
          <h3>{booking.facility.name}</h3>
          <span className="status-badge">{booking.status}</span>
        </div>

        <p><CalendarDays size={16} /> {booking.date}</p>
        <p><Clock size={16} /> {booking.startTime} – {booking.endTime}</p>
        <p><MapPin size={16} /> {booking.facility.location}</p>
        <p>Booked by: {booking.customer}</p>
      </div>

      <button
        className="button button-danger button-small"
        onClick={() => {
          if (window.confirm("Are you sure you want to cancel this booking?")) {
            onCancel(booking.id);
          }
        }}
      >
        <Trash2 size={16} /> Cancel
      </button>
    </article>
  );
}
