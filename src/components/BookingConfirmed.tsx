
import { CheckCircle2, CalendarDays, MapPin } from "lucide-react";
import type { Booking } from "./BookingForm";

interface Props {
  booking: Booking;
  onDone: () => void;
}

export default function BookingConfirmed({ booking, onDone }: Props) {
  return (
    <section className="confirmation-card">
      <div className="confirmation-icon"><CheckCircle2 size={44} /></div>
      <span className="eyebrow">BOOKING SUCCESSFUL</span>
      <h2>Your Court Is Reserved!</h2>
      <p>Your booking details are shown below.</p>

      <div className="confirmation-details">
        <div><span>Facility</span><strong>{booking.facility.name}</strong></div>
        <div><span>Booked by</span><strong>{booking.customer}</strong></div>
        <div><span><CalendarDays size={16} /> Date</span><strong>{booking.date}</strong></div>
        <div><span>Time</span><strong>{booking.startTime} – {booking.endTime}</strong></div>
        <div><span><MapPin size={16} /> Location</span><strong>{booking.facility.location}</strong></div>
        <div><span>Status</span><strong className="green">{booking.status}</strong></div>
      </div>

      <button className="button button-primary button-full" onClick={onDone}>
        View My Bookings
      </button>
    </section>
  );
}
