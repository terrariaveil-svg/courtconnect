import './ui.css';
import './BookingDonePage.css';
import AppNav from './AppNav';
import type { AppBooking, NavProps } from './appTypes';
import { fmtRange, fmtWeekday, totalOf } from './appUtils';

type BookingDonePageProps = {
  nav: NavProps;
  booking: AppBooking;
  onViewBookings: () => void;
  onBackToCourts: () => void;
};

export default function BookingDonePage({
  nav,
  booking,
  onViewBookings,
  onBackToCourts,
}: BookingDonePageProps) {
  const rows = [
    { label: 'Court', value: `${booking.venueName} · ${booking.courtLabel}` },
    { label: 'Date', value: fmtWeekday(booking.date) },
    { label: 'Time', value: fmtRange(booking.startHour, booking.endHour) },
    { label: 'Booking ID', value: booking.ref },
    { label: 'Total', value: `₱${totalOf(booking)}` },
  ];

  return (
    <div className="app-page">
      <AppNav {...nav} active="spaces" />

      <main className="app-main bd-main">
        <section className="bd-card ui-card" aria-live="polite">
          <div className="bd-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>

          <h1 className="app-title">Booking Confirmed!</h1>
          <p className="bd-sub">Your court has been successfully booked.</p>

          <dl className="bd-details">
            {rows.map((row) => (
              <div className="bd-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <button type="button" className="ui-btn ui-btn-primary ui-btn-block" onClick={onViewBookings}>
            View My Bookings
          </button>
          <button type="button" className="ui-btn ui-btn-outline ui-btn-block bd-second" onClick={onBackToCourts}>
            Back to Courts
          </button>
        </section>
      </main>
    </div>
  );
}