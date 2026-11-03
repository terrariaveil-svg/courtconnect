
import { Bell, CalendarDays, MapPin } from "lucide-react";
import type { Booking } from "./BookingForm";

interface NotificationsProps {
  bookings: Booking[];
}

export default function Notifications({
  bookings,
}: NotificationsProps) {
  const sortedBookings = [...bookings].sort((a, b) => {
    return (
      new Date(`${b.date}T${b.startTime}:00`).getTime() -
      new Date(`${a.date}T${a.startTime}:00`).getTime()
    );
  });

  return (
    <section className="page-section">
      <span className="eyebrow">STAY UPDATED</span>

      <h2>Notifications</h2>

      <p className="section-intro">
        Keep track of your court bookings and updates.
      </p>

      {sortedBookings.length === 0 ? (
        <div className="empty-state">
          <Bell size={36} />
          <h3>No notifications yet</h3>
          <p>
            Your booking updates will appear here when you reserve a court.
          </p>
        </div>
      ) : (
        <div className="facility-grid">
          {sortedBookings.map((booking) => (
            <article className="facility-card" key={booking.id}>
              <div className="facility-content">
                <span className="image-tag">Booking Confirmed</span>

                <h3>{booking.facility.name}</h3>

                <p className="location-line">
                  <CalendarDays size={16} />
                  {booking.date}
                </p>

                <p className="location-line">
                  <Bell size={16} />
                  {booking.startTime} – {booking.endTime}
                </p>

                <p className="location-line">
                  <MapPin size={16} />
                  {booking.facility.location}
                </p>

                <strong className="price">
                  {booking.status}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
