
import { CalendarDays } from "lucide-react";
import BookingDetails from "./BookingDetails";
import type { Booking } from "./BookingForm";

interface Props {
  bookings: Booking[];
  onCancel: (id: number) => void;
}

export default function MyBookings({ bookings, onCancel }: Props) {
  return (
    <section className="page-section">
      <span className="eyebrow">YOUR RESERVATIONS</span>
      <h2>My Bookings</h2>
      <p className="section-intro">
        View your reserved facilities and scheduled playing times.
      </p>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={42} />
          <h3>No bookings yet</h3>
          <p>Your confirmed reservations will appear here.</p>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <BookingDetails
              key={booking.id}
              booking={booking}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
