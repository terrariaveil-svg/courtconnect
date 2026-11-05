import { useEffect, useState } from 'react';
import './VenueDetail.css';
import TopNav from './TopNav';
import type { Facility } from './AvailableSpaces';
import type { Booking } from './BookingForm';
import { todayISO } from './eventsList';

type VenueDetailProps = {
  facility: Facility;
  facilities?: Facility[];
  onSelectFacility?: (id: number) => void;

  // Kept temporarily for compatibility with SpacesPage.
  // This callback is intentionally NOT called when viewing a facility.
  onFacilityViewed?: (facility: Facility) => void;

  userName?: string;
  unreadCount: number;
  bookingCount?: number;
  onBack: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  onOpenSpaces?: () => void;
  onOpenEvents?: () => void;
  onOpenNotifications?: () => void;
  onRent: (booking: Booking) => void;
};

const SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
];

type AmenityIconName =
  | 'grid'
  | 'snow'
  | 'shower'
  | 'parking'
  | 'wifi'
  | 'dumbbell'
  | 'pulse'
  | 'locker';

type Amenity = {
  icon: AmenityIconName;
  title: string;
  text: string;
};

const COURT_AMENITIES: Amenity[] = [
  { icon: 'grid', title: '2 Courts', text: 'Professional indoor courts' },
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

function addHour(label: string): string {
  const [time, period] = label.split(' ');
  let h = parseInt(time.split(':')[0], 10) % 12;

  if (period === 'PM') h += 12;

  h = (h + 1) % 24;

  const nextPeriod = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;

  return `${String(h12).padStart(2, '0')}:00 ${nextPeriod}`;
}

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

export default function VenueDetail({
  facility,
  facilities = [],
  onSelectFacility,
  userName = 'Alex',
  unreadCount,
  bookingCount = 0,
  onBack,
  onOpenProfile,
  onOpenBookings,
  onOpenSpaces,
  onOpenEvents,
  onOpenNotifications,
  onRent,
}: VenueDetailProps) {
  const [slot, setSlot] = useState(SLOTS[0]);
  const [imageIndex, setImageIndex] = useState(0);

  // Only scroll to the top when the selected facility changes.
  // Do NOT record a recent visit here.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });

    setImageIndex(0);
  }, [facility.id]);

  const isGym = facility.type === 'Gym floor';
  const amenities = isGym ? GYM_AMENITIES : COURT_AMENITIES;

  const baseOf = (url: string) => url.split('?')[0];

  const images = [
    facility.image,
    ...EXTRA_IMAGES.filter(
      (url) => baseOf(url) !== baseOf(facility.image),
    ),
  ];

  const today = new Date();
  const bookingDate = todayISO();

  const shortDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const about = isGym
    ? `${facility.name} offers a premium gym floor experience for members of all levels. Our well-maintained equipment, clean facilities, and friendly environment make it the perfect place to train, build strength, and stay active.`
    : `${facility.name} offers a premium indoor ${facility.type.toLowerCase()} experience for players of all levels. Our well-maintained courts, clean facilities, and friendly environment make it the perfect place to play, train, and enjoy the sport.`;

  const tags = [
    facility.type,
    'Indoor',
    'For All Skill Levels',
    'Friendly Community',
  ];

  const rent = () => {
    onRent({
      id: Date.now(),
      facility,
      date: bookingDate,
      startTime: slot,
      endTime: addHour(slot),
      customer: userName,
      status: 'Pending',
    });
  };

  const prev = () => {
    setImageIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = () => {
    setImageIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className="vd-page">
      <TopNav
        active="spaces"
        userName={userName}
        unreadCount={unreadCount}
        bookingCount={bookingCount}
        onHome={onBack}
        onOpenProfile={onOpenProfile}
        onOpenBookings={onOpenBookings}
        onOpenSpaces={onOpenSpaces}
        onOpenEvents={onOpenEvents}
        onOpenNotifications={onOpenNotifications}
      />

      <main className="vd-main">
        <button type="button" className="vd-back" onClick={onBack}>
          ‹ Back to Available Spaces
        </button>

        {facilities.length > 1 && onSelectFacility && (
          <section className="vd-court-picker" aria-label="Available courts">
            <strong>Choose a court</strong>

            <div className="vd-court-options">
              {facilities.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`vd-court-option${option.id === facility.id ? ' is-selected' : ''}`}
                  aria-pressed={option.id === facility.id}
                  onClick={() => onSelectFacility(option.id)}
                >
                  <img src={option.image} alt="" />

                  <span>
                    <strong>{option.name}</strong>
                    <span>
                      {option.type} · ₱{option.price} / hour
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="vd-grid">
          <div className="vd-left">
            <span className="vd-badge">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-8 9 8M5 10v10h14V10" />
              </svg>
              Indoor
            </span>

            <h1 className="vd-title">{facility.name}</h1>

            <div className="vd-meta">
              <span className="vd-rating">
                <span className="vd-star">★</span> 4.8{' '}
                <span className="vd-reviews">(124 reviews)</span>
              </span>

              <span className="vd-location">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
                {facility.location}
              </span>
            </div>

            <div className="vd-gallery">
              <img
                src={images[imageIndex]}
                alt={facility.name}
                className="vd-gallery-img"
              />

              <button type="button" className="vd-arrow vd-arrow-left" onClick={prev} aria-label="Previous photo">
                ‹
              </button>

              <button type="button" className="vd-arrow vd-arrow-right" onClick={next} aria-label="Next photo">
                ›
              </button>

              <div className="vd-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`vd-dot${i === imageIndex ? ' is-active' : ''}`}
                    onClick={() => setImageIndex(i)}
                    aria-label={`Show photo ${i + 1}`}
                  />
                ))}
              </div>
            </div>

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

            <section className="vd-about">
              <h2>About This Venue</h2>
              <p>{about}</p>

              <div className="vd-tags">
                {tags.map((tag) => (
                  <span className="vd-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="vd-summary" aria-label="Booking summary">
            <h2 className="vd-summary-title">Booking Summary</h2>

            <div className="vd-venue">
              <img src={facility.image} alt="" className="vd-venue-img" />

              <div className="vd-venue-info">
                <strong>{facility.name}</strong>

                <span className="vd-venue-rating">
                  <span className="vd-star">★</span> 4.8{' '}
                  <span className="vd-reviews">(124 reviews)</span>
                </span>

                <span className="vd-badge vd-badge-small">Indoor</span>

                <span className="vd-venue-loc">
                  <i className="vd-venue-dot" />
                  {facility.location}
                </span>
              </div>
            </div>

            <div className="vd-divider" />

            <div className="vd-slots-head">
              <strong>Today’s Open Slots</strong>

              <span className="vd-slots-date">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                {shortDate}
              </span>
            </div>

            <div className="vd-slots" role="radiogroup" aria-label="Open time slots">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={slot === s}
                  className={`vd-slot${slot === s ? ' is-selected' : ''}`}
                  onClick={() => setSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="vd-divider" />

            <div className="vd-price">
              <span className="vd-price-icon">$</span>
              <span className="vd-price-label">Price per Hour</span>

              <div className="vd-price-value">
                <strong>₱{facility.price}</strong>
                <span>/ hour</span>
              </div>
            </div>

            <p className="vd-selected">
              Selected: {slot} – {addHour(slot)}
            </p>

            <button type="button" className="vd-rent" onClick={rent}>
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