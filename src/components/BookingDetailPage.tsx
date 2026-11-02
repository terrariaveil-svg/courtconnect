import { useState } from 'react';
import './ui.css';
import './BookingDetailPage.css';
import AppNav from './AppNav';
import ModalShell from './ModalShell';
import type { AppBooking, NavProps } from './appTypes';
import { fmtHour, fmtWeekday, hoursOf, statusOf, totalOf } from './appUtils';

type BookingDetailPageProps = {
  nav: NavProps;
  booking: AppBooking;
  onBack: () => void;
  onCancel: (id: number) => void;
  onBookAgain: (venueId: number) => void;
};

export default function BookingDetailPage({
  nav,
  booking,
  onBack,
  onCancel,
  onBookAgain,
}: BookingDetailPageProps) {
  const [confirming, setConfirming] = useState(false);
  const status = statusOf(booking);

  const info = [
    { label: 'Name', value: booking.customer },
    { label: 'Email', value: booking.email },
    { label: 'Payment Method', value: booking.payment },
    { label: 'Booking ID', value: booking.ref },
    { label: 'Total', value: `₱${totalOf(booking)} (${hoursOf(booking)} hr)` },
  ];

  return (
    <div className="app-page">
      <AppNav {...nav} active="bookings" />

      <main className="app-main bdt-main">
        <section className="bdt-card ui-card">
          <button type="button" className="app-crumb" onClick={onBack}>
            ← Back
          </button>
          <h1 className="app-title">Booking Details</h1>

          {status === 'Cancelled' && (
            <p className="ui-error" role="status">
              This booking was cancelled.
            </p>
          )}

          <div className="bdt-venue">
            <img src={booking.venueImage} alt="" className="bdt-img" />
            <div className="bdt-venue-main">
              <div className="bdt-venue-top">
                <h2>{booking.venueName}</h2>
                <span
                  className={`ui-pill ${status === 'Cancelled' ? 'ui-pill-red' : status === 'Completed' ? 'ui-pill-gray' : 'ui-pill-green'}`}
                >
                  {status}
                </span>
              </div>
              <p className="bdt-loc">
                {booking.indoor ? 'Indoor' : 'Outdoor'} · {booking.courtLabel} · {booking.location}
              </p>

              <div className="bdt-facts">
                <div>
                  <span>Date</span>
                  <strong>{fmtWeekday(booking.date)}</strong>
                </div>
                <div>
                  <span>Time</span>
                  <strong>
                    {fmtHour(booking.startHour)} – {fmtHour(booking.endHour)}
                  </strong>
                </div>
                <div>
                  <span>Players</span>
                  <strong>{booking.players}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bdt-info">
            <h3>Booking Information</h3>
            <dl>
              {info.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {status === 'Upcoming' ? (
            <button type="button" className="ui-btn ui-btn-primary ui-btn-block" onClick={() => setConfirming(true)}>
              Cancel Booking
            </button>
          ) : (
            <button
              type="button"
              className="ui-btn ui-btn-primary ui-btn-block"
              onClick={() => onBookAgain(booking.venueId)}
            >
              Book Again
            </button>
          )}
        </section>
      </main>

      {confirming && (
        <ModalShell title="Cancel this booking?" onClose={() => setConfirming(false)} width={420}>
          <p className="bdt-confirm">
            {booking.venueName} on {fmtWeekday(booking.date)}. This can’t be undone.
          </p>
          <div className="ui-modal-actions">
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setConfirming(false)}>
              Keep booking
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger-solid"
              onClick={() => {
                onCancel(booking.id);
                setConfirming(false);
              }}
            >
              Yes, cancel it
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}