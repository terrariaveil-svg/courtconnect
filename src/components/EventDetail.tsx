import { useEffect, useState } from 'react';
import './EventDetail.css';
import type { ClubEvent } from './eventsList';
import { fmtFull } from './eventsList';
import { extrasFor } from './eventDetails';

type EventDetailProps = {
  event: ClubEvent;
  others: ClubEvent[];
  tickets: number; // 0 when you are not registered
  onBack: () => void;
  onRegister: (id: number, tickets: number) => void;
  onCancel: (id: number) => void;
  onOpenEvent: (id: number) => void;
};

const priceText = (price: number): string => (price === 0 ? 'Free' : `₱${price}`);

export default function EventDetail({
  event,
  others,
  tickets,
  onBack,
  onRegister,
  onCancel,
  onOpenEvent,
}: EventDetailProps) {
  const extras = extrasFor(event.category);
  const [count, setCount] = useState(1);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const registered = tickets > 0;
  const spotsLeft = Math.max(0, event.spotsLeft - tickets);
  const maxTickets = Math.max(1, Math.min(4, spotsLeft));
  const spots = Math.min(count, maxTickets);
  const percentFull = Math.round(((event.capacity - spotsLeft) / event.capacity) * 100);
  const total = event.price * (registered ? tickets : spots);
  const code = `CC-EV-${String(event.id).padStart(3, '0')}`;

  return (
    <div className="ed-wrap">
      <button type="button" className="ed-back" onClick={onBack}>
        ‹ Back to Events
      </button>

      <div className="ed-grid">
        {/* ---------- Left: the event ---------- */}
        <div className="ed-main">
          <div className="ed-hero">
            <img src={event.image} alt={event.name} />
            <span className="ed-tag">{event.category}</span>
          </div>

          <h1 className="ed-title">{event.name}</h1>

          <ul className="ed-meta">
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              {fmtFull(event.date)}
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {event.time}
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {event.venue} · {event.city}
            </li>
          </ul>

          <section className="ed-card">
            <h2>About this event</h2>
            <p>{event.description}</p>
            <p className="ed-organizer">
              Organized by <strong>{event.organizer}</strong>
            </p>
          </section>

          <section className="ed-card">
            <h2>Schedule</h2>
            <ol className="ed-schedule">
              {extras.schedule.map((item) => (
                <li key={item.time}>
                  <span className="ed-time">{item.time}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="ed-card">
            <h2>What to bring</h2>
            <div className="ed-chips">
              {extras.bring.map((item) => (
                <span className="ed-chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* ---------- Right: reserve a spot ---------- */}
        <aside className="ed-side" aria-label="Reserve your spot">
          <h2>{registered ? 'You’re registered' : 'Reserve your spot'}</h2>

          <div className="ed-price">
            <strong>{priceText(event.price)}</strong>
            {event.price > 0 && <span>/ person</span>}
          </div>

          <div className="ed-spots">
            <div className="ed-spots-text">
              <span>{spotsLeft === 0 ? 'Fully booked' : `${spotsLeft} spots left`}</span>
              <span>{percentFull}% full</span>
            </div>
            <div className="ed-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentFull}>
              <span style={{ width: `${percentFull}%` }} />
            </div>
          </div>

          {registered ? (
            <>
              <div className="ed-done" role="status">
                <strong>See you there!</strong>
                <span>
                  {tickets} spot{tickets === 1 ? '' : 's'} reserved · Code {code}
                </span>
              </div>

              <div className="ed-total">
                <span>Total</span>
                <strong>{event.price === 0 ? 'Free' : `₱${total}`}</strong>
              </div>

              {confirmCancel ? (
                <div className="ed-confirm" role="alert">
                  <p>Cancel your registration?</p>
                  <div>
                    <button
                      type="button"
                      className="ed-btn ed-btn-danger"
                      onClick={() => {
                        onCancel(event.id);
                        setConfirmCancel(false);
                        setCount(1);
                      }}
                    >
                      Yes, cancel
                    </button>
                    <button type="button" className="ed-btn ed-btn-outline" onClick={() => setConfirmCancel(false)}>
                      Keep
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="ed-btn ed-btn-outline ed-block" onClick={() => setConfirmCancel(true)}>
                  Cancel registration
                </button>
              )}
            </>
          ) : (
            <>
              <div className="ed-stepper">
                <span>Spots</span>
                <div>
                  <button
                    type="button"
                    aria-label="Fewer spots"
                    disabled={spots <= 1}
                    onClick={() => setCount(spots - 1)}
                  >
                    −
                  </button>
                  <strong aria-live="polite">{spots}</strong>
                  <button
                    type="button"
                    aria-label="More spots"
                    disabled={spots >= maxTickets || spotsLeft === 0}
                    onClick={() => setCount(spots + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="ed-total">
                <span>Total</span>
                <strong>{event.price === 0 ? 'Free' : `₱${total}`}</strong>
              </div>

              <button
                type="button"
                className="ed-btn ed-btn-primary ed-block"
                disabled={spotsLeft === 0}
                onClick={() => onRegister(event.id, spots)}
              >
                {spotsLeft === 0 ? 'Fully booked' : 'Register'}
              </button>
              <p className="ed-note">
                {event.price === 0 ? 'No payment needed.' : 'Pay at the venue when you check in.'}
              </p>
            </>
          )}
        </aside>
      </div>

      {/* ---------- More events ---------- */}
      {others.length > 0 && (
        <section className="ed-more">
          <h2>More events</h2>
          <div className="ed-more-grid">
            {others.slice(0, 2).map((o) => (
              <button type="button" className="ed-more-card" key={o.id} onClick={() => onOpenEvent(o.id)}>
                <img src={o.image} alt="" />
                <span>
                  <strong>{o.name}</strong>
                  <small>
                    {fmtFull(o.date)} · {priceText(o.price)}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}