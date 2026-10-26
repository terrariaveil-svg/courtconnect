
import { Bell, CalendarCheck, Info } from "lucide-react";
import type { Booking } from "./BookingForm";

interface Props {
  bookings?: Booking[];
}

export default function Notifications({ bookings = [] }: Props) {
  return (
    <section className="page-section">
      <span className="eyebrow">STAY UPDATED</span>
      <h2>Notifications</h2>
      <p className="section-intro">
        Updates about your CourtConnect activity.
      </p>

      <div className="notification-list">
        <article className="notification-item">
          <div className="notification-icon"><Info size={20} /></div>
          <div>
            <strong>Welcome to CourtConnect!</strong>
            <p>Explore available sports facilities and book your next game.</p>
          </div>
        </article>

        {bookings.map((booking) => (
          <article className="notification-item" key={booking.id}>
            <div className="notification-icon"><CalendarCheck size={20} /></div>
            <div>
              <strong>Booking confirmed</strong>
              <p>
                {booking.facility.name} on {booking.date}, from{" "}
                {booking.startTime} to {booking.endTime}.
              </p>
            </div>
            <Bell size={17} />
          </article>
        ))}
      </div>
    </section>
  );
}
