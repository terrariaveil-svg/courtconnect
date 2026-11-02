VenueDetail.tsximport { useState } from 'react';
import './ui.css';
import './VenueDetail.css';
import AppNav from './AppNav';
import CalendarPicker from './CalendarPicker';
import type { AppBooking, NavProps } from './appTypes';
import { SLOT_HOURS } from './venues';
import type { Venue } from './venues';
import { fmtHour, slotState, todayISO } from './appUtils';

export type RentSelection = { venue: Venue; date: string; startHour: number };

type VenueDetailProps = {
  nav: NavProps;
  pool: Venue[];
  startId?: number;
  bookings: AppBooking[];
  onRent: (selection: RentSelection) => void;
};

type AmenityIconName = 'grid' | 'snow' | 'shower' | 'parking' | 'wifi' | 'dumbbell' | 'pulse' | 'locker';

type Amenity = { icon: AmenityIconName; title: string; text: string };

const courtAmenities = (courts: number): Amenity[] => [
  { icon: 'grid', title: `${courts} Court${courts === 1 ? '' : 's'}`, text: 'Professional courts' },
  { icon: 'snow', title: 'Air Conditioned', text: 'Cool and comfortable' },
  { icon: 'shower', title: 'Shower Rooms', text: 'Clean and accessible' },
  { icon: 'parking', title: 'Parking Area', text: 'Secure parking space' },
  { icon: 'wifi', title: 'Free Wi-Fi', text: 'Stay connected' },
];

const GYM_AMENITIES: Amenity[] = [
  { icon: 'dumbbell', title: 'Free Weights', text: 'Racks, benches, dumbbells' },
  { icon: 'pulse', title: 'Cardio Zone', text: 'Treadmills and bikes' },
  { icon: 'snow', title: 'Air Conditioned', text: 'Cool and comfortable' },
  { icon: 'locker', title: 'Lockers', text: 'Secure storage for your things' },
  { icon: 'wifi', title: 'Free Wi-Fi', text: 'Stay connected' },
];

function AmenityIcon({ name }: { name: AmenityIconName }) {
  const common = {
    viewBox: '0 0 24 24',
    width: 16,
    height: 16,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'snow':
      return (
        <svg {...common}>
          <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" />
        </svg>
      );
    case 'shower':
      return (
        <svg {...common}>
          <path d="M6 14a6 6 0 0 1 12 0H6zM12 8V4M8 18v2M12 18v2M16 18v2" />
        </svg>
      );
    case 'parking':
      return (
        <svg {...common}>
          <path d="M8 20V4h5a4 4 0 0 1 0 8H8" />
        </svg>
      );
    case 'wifi':
      return (
        <svg {...common}>
          <path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      );
    case 'dumbbell':
      return (
        <svg {...common}>
          <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
        </svg>
      );
    case 'pulse':
      return (
        <svg {...common}>
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </svg>
      );
    case 'locker':
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M12 3v18M9 10h.01M15 10h.01" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      );
  }
}

export default function VenueDetail({ nav, pool, startId, bookings, onRent }: VenueDetailProps) {
  const initial = Math.max(0, pool.findIndex((v) => v.id === startId));
  const [index, setIndex] = useState(initial);
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<number | null>(null);

  const venue = pool[index];
  const today = todayISO();

  // The arrows move between spaces: the name, photo, price and slots all change
  const go = (delta: number) => {
    setIndex((i) => (i + delta + pool.length) % pool.length);
    setSlot(null);
  };

  const states = SLOT_HOURS.map((hour) => ({
    hour,
    state: slotState(venue.id, date, hour, bookings),
  }));
  const firstFree = states.find((s) => s.state === 'free')?.hour ?? null;
  const chosen =
    slot !== null && states.some((s) => s.hour === slot && s.state === 'free') ? slot : firstFree;

  const amenities = venue.kind === 'gym' ? GYM_AMENITIES : courtAmenities(venue.courts);

  return (
    <div className="app-page vd-page">
      <AppNav {...nav} active="spaces" />

      <main className="app-main vd-main">
        <button type="button" className="app-crumb" onClick={nav.onHome}>
          ‹ Back to Home
        </button>

        <div className="vd-grid">
          {/* Left column */}
          <div className="vd-left" key={venue.id}>
            <span className="vd-badge">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-8 9 8M5 10v10h14V10" />
              </svg>
              {venue.indoor ? 'Indoor' : 'Outdoor'}
            </span>

            <h1 className="vd-title">{venue.name}</h1>

            <div className="vd-meta">
              <span className="vd-rating">
                <span className="vd-star">★</span> {venue.rating.toFixed(1)}{' '}
                <span className="vd-reviews">({venue.reviews} reviews)</span>
              </span>
              <span className="vd-location">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
                {venue.location}
              </span>
            </div>

            {/* Gallery: the arrows switch to the previous / next space */}
            <div className="vd-gallery">
              <img src={venue.image} alt={venue.name} className="vd-gallery-img" />

              <span className="vd-count">
                {index + 1} / {pool.length}
              </span>

              <button type="button" className="vd-arrow vd-arrow-left" onClick={() => go(-1)} aria-label="Previous space">
                ‹
              </button>
              <button type="button" className="vd-arrow vd-arrow-right" onClick={() => go(1)} aria-label="Next space">
                ›
              </button>

              <div className="vd-dots">
                {pool.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`vd-dot${i === index ? ' is-active' : ''}`}
                    onClick={() => {
                      setIndex(i);
                      setSlot(null);
                    }}
                    aria-label={`Show ${v.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="vd-amenities">
              {amenities.map((a) => (
                <div className="vd-amenity" key={a.title}>
                  <span className={`vd-amenity-icon vd-icon-${a.icon}`}>
                    <AmenityIcon name={a.icon} />
                  </span>
                  <span className="vd-amenity-text">
                    <strong>{a.title}</strong>
                    <span>{a.text}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* About */}
            <section className="vd-about">
              <h2>About This Venue</h2>
              <p>{venue.about}</p>
              <div className="vd-tags">
                {venue.tags.map((tag) => (
                  <span className="vd-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: booking summary */}
          <aside className="vd-summary" aria-label="Booking summary">
            <h2 className="vd-summary-title">Booking Summary</h2>

            <div className="vd-venue" key={`sum-${venue.id}`}>
              <img src={venue.image} alt="" className="vd-venue-img" />
              <div className="vd-venue-info">
                <strong>{venue.name}</strong>
                <span className="vd-venue-rating">
                  <span className="vd-star">★</span> {venue.rating.toFixed(1)}{' '}
                  <span className="vd-reviews">({venue.reviews} reviews)</span>
                </span>
                <span className="vd-badge vd-badge-small">{venue.indoor ? 'Indoor' : 'Outdoor'}</span>
                <span className="vd-venue-loc">
                  <i className="vd-venue-dot" />
                  {venue.location}
                </span>
              </div>
            </div>

            <div className="vd-divider" />

            <div className="vd-slots-head">
              <strong>{date === today ? 'Today’s Open Slots' : 'Open Slots'}</strong>
              <CalendarPicker
                value={date}
                min={today}
                align="right"
                className="vd-date-btn"
                ariaLabel="Choose a date"
                onChange={(iso) => {
                  if (iso) {
                    setDate(iso);
                    setSlot(null);
                  }
                }}
              />
            </div>

            <div className="vd-slots" role="radiogroup" aria-label="Open time slots">
              {states.map(({ hour, state }) => (
                <button
                  key={hour}
                  type="button"
                  role="radio"
                  aria-checked={chosen === hour}
                  disabled={state !== 'free'}
                  title={state === 'booked' ? 'Already booked' : state === 'past' ? 'Time has passed' : undefined}
                  className={`vd-slot${chosen === hour ? ' is-selected' : ''}`}
                  onClick={() => setSlot(hour)}
                >
                  {fmtHour(hour)}
                </button>
              ))}
            </div>

            <div className="vd-divider" />

            <div className="vd-price">
              <span className="vd-price-icon">$</span>
              <span className="vd-price-label">Price per Hour</span>
              <div className="vd-price-value">
                <strong>₱{venue.price}</strong>
                <span>/ hour</span>
              </div>
            </div>

            <p className="vd-selected">
              {chosen !== null
                ? `Selected: ${fmtHour(chosen)} – ${fmtHour(chosen + 1)}`
                : 'No open slots on this date. Pick another day.'}
            </p>

            <button
              type="button"
              className="vd-rent"
              disabled={chosen === null}
              onClick={() => {
                if (chosen !== null) onRent({ venue, date, startHour: chosen });
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
              </svg>
              Rent
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}