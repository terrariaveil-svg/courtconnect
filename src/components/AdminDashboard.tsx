import './AdminDashboard.css';
import type { Booking } from './BookingForm';
import type { ApprovalStatus } from './approval';
import type { ClubEvent } from './eventsList';

type AdminDashboardProps = {
  bookings: Booking[];
  events: ClubEvent[];
  registrations: Record<number, number>;
  registrationStatuses: Record<number, ApprovalStatus>;
  onBookingStatusChange: (id: number, status: ApprovalStatus) => void;
  onRegistrationStatusChange: (id: number, status: ApprovalStatus) => void;
  onSignOut: () => void;
};

export default function AdminDashboard({
  bookings,
  events,
  registrations,
  registrationStatuses,
  onBookingStatusChange,
  onRegistrationStatusChange,
  onSignOut,
}: AdminDashboardProps) {
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending');
  const pendingRegistrations = events.filter(
    (event) =>
      registrations[event.id] > 0 &&
      registrationStatuses[event.id] === 'Pending',
  );

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">COURTCONNECT ADMIN</span>
          <h1>Approval dashboard</h1>
          <p>Review client booking and event registration requests.</p>
        </div>
        <button type="button" className="admin-signout" onClick={onSignOut}>
          Sign out
        </button>
      </header>

      <section className="admin-section" aria-labelledby="admin-bookings-title">
        <div className="admin-section-heading">
          <h2 id="admin-bookings-title">Booking requests</h2>
          <span>{pendingBookings.length} pending</span>
        </div>
        {pendingBookings.length === 0 ? (
          <p className="admin-empty">No booking requests need approval.</p>
        ) : (
          <ul className="admin-list">
            {pendingBookings.map((booking) => (
              <li className="admin-request" key={booking.id}>
                <div className="admin-request-info">
                  <strong>{booking.facility.name}</strong>
                  <span>{booking.customer} · {booking.facility.location}</span>
                  <span>{booking.date} · {booking.startTime}–{booking.endTime}</span>
                  <span>₱{booking.facility.price} / hour</span>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-approve"
                    onClick={() => onBookingStatusChange(booking.id, 'Confirmed')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-reject"
                    onClick={() => onBookingStatusChange(booking.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-section" aria-labelledby="admin-events-title">
        <div className="admin-section-heading">
          <h2 id="admin-events-title">Event registration requests</h2>
          <span>{pendingRegistrations.length} pending</span>
        </div>
        {pendingRegistrations.length === 0 ? (
          <p className="admin-empty">No event registration requests need approval.</p>
        ) : (
          <ul className="admin-list">
            {pendingRegistrations.map((event) => (
              <li className="admin-request" key={event.id}>
                <div className="admin-request-info">
                  <strong>{event.name}</strong>
                  <span>{registrations[event.id]} spot(s) · {event.category}</span>
                  <span>{event.date} · {event.time}</span>
                  <span>{event.venue}, {event.city}</span>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-approve"
                    onClick={() => onRegistrationStatusChange(event.id, 'Confirmed')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-reject"
                    onClick={() => onRegistrationStatusChange(event.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
