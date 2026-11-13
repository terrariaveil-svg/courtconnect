import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import './DiscoverEvents.css';
import { CalendarGrid, DatePicker } from './EventCalendar';
import { CATEGORIES, addDaysISO, emojiFor, fmtFull, fmtShort, labelFor, todayISO } from './eventsList';
import type { ClubEvent, EventCategory, NewEvent } from './eventsList';

type DiscoverEventsProps = {
  events: ClubEvent[];
  registrations: Record<number, number>;
  onOpenEvent: (id: number) => void;
  onCreate: (data: NewEvent) => Promise<void>;
};

const TINT: Record<EventCategory, string> = {
  Badminton: '#d8eee0',
  Basketball: '#e1e6fb',
  Fitness: '#fae8d8',
  Tournament: '#faf0c8',
};

const priceText = (price: number): string => (price === 0 ? 'Free' : `₱${price}`);

function Modal({
  title,
  onClose,
  width = 440,
  children,
}: {
  title: string;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  // Close with the Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="de-backdrop" onMouseDown={onClose}>
      <div
        className="de-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="de-modal-head">
          <h2>{title}</h2>
          <button type="button" className="de-modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DiscoverEvents({
  events,
  registrations,
  onOpenEvent,
  onCreate,
}: DiscoverEventsProps) {
  const today = todayISO();

  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<'all' | EventCategory>('all');
  const [date, setDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Create Event form
  const [fName, setFName] = useState('');
  const [fCategory, setFCategory] = useState<EventCategory>('Badminton');
  const [fDate, setFDate] = useState(addDaysISO(today, 7));
  const [fTime, setFTime] = useState('9:00 AM – 12:00 PM');
  const [fVenue, setFVenue] = useState('');
  const [fPrice, setFPrice] = useState('0');
  const [fSpots, setFSpots] = useState('20');
  const [fImage, setFImage] = useState<File | null>(null);
  const [fError, setFError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const q = query.trim().toLowerCase();
  const upcoming = events.filter((e) => e.date >= today);

  const visible = upcoming
    .filter(
      (e) =>
        !q ||
        `${e.name} ${e.category} ${labelFor(e.category)} ${e.venue} ${e.city}`.toLowerCase().includes(q),
    )
    .filter((e) => sport === 'all' || e.category === sport)
    .filter((e) => !date || e.date === date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const filtersOn = q !== '' || sport !== 'all' || date !== null;

  const clearFilters = () => {
    setQuery('');
    setSport('all');
    setDate(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const price = Number(fPrice);
    const spots = Number(fSpots);

    setFError('');
    if (!fName.trim()) return setFError('Please enter an event name.');
    if (!fVenue.trim()) return setFError('Please enter where the event is held.');
    if (!fDate || fDate < today) return setFError('Please choose a date that is today or later.');
    if (!Number.isFinite(price) || price < 0) return setFError('Price must be 0 or more.');
    if (!Number.isInteger(spots) || spots < 1) return setFError('Spots must be at least 1.');
    if (!fImage || !fImage.type.startsWith('image/')) {
      return setFError('Choose an image file for the event.');
    }
    if (fImage.size > 2 * 1024 * 1024) {
      return setFError('The event image must be 2 MB or smaller.');
    }

    setIsCreating(true);
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('The selected image could not be read.'));
          }
        };
        reader.onerror = () => reject(new Error('The selected image could not be read.'));
        reader.readAsDataURL(fImage);
      });

      await onCreate({
        name: fName.trim(),
        category: fCategory,
        date: fDate,
        time: fTime.trim() || '9:00 AM – 12:00 PM',
        venue: fVenue.trim(),
        price,
        spots,
        image,
      });

      clearFilters();
      setCreateOpen(false);
      setFName('');
      setFVenue('');
      setFImage(null);
      form.reset();
    } catch (error) {
      setFError(error instanceof Error ? error.message : 'Unable to create the event.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="de-page">
      <div className="de-wrap">
        <h1 className="de-title">Discover Events</h1>
        <p className="de-sub">Find competitions, sports meetups, and activities near you.</p>

        <div className="de-filters">
          <label className="de-search">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search events, sports, or locations..."
              value={query}
              aria-label="Search events"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <select
            className="de-box de-select"
            value={sport}
            aria-label="Filter by sport"
            onChange={(e) => setSport(e.target.value as 'all' | EventCategory)}
          >
            <option value="all">All sports</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>

          <DatePicker
            value={date}
            onChange={setDate}
            marked={upcoming.map((e) => e.date)}
            placeholder="Any date"
            clearable
            align="right"
            className="de-box de-date"
            ariaLabel="Filter by date"
          />

          <button type="button" className="de-create" onClick={() => setCreateOpen(true)}>
            + Create Event
          </button>
        </div>

        <div className="de-heading">
          <h2>Upcoming events</h2>
          <button type="button" className="de-link" onClick={() => setCalendarOpen(true)}>
            View calendar
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="de-empty">
            <h3>No events found</h3>
            <p>{filtersOn ? 'Try a different search, sport or date.' : 'There are no upcoming events yet.'}</p>
            <button
              type="button"
              className="de-view de-view-inline"
              onClick={filtersOn ? clearFilters : () => setCreateOpen(true)}
            >
              {filtersOn ? 'Clear filters' : 'Create an event'}
            </button>
          </div>
        ) : (
          <div className="de-grid">
            {visible.map((e) => {
              const reserved = registrations[e.id] ?? 0;
              const left = Math.max(0, e.spotsLeft - reserved);

              return (
                <article className="de-card" key={e.id}>
                  <div className="de-cover" style={{ background: TINT[e.category] }}>
                    <img className="de-cover-image" src={e.image} alt="" />
                    <span className="de-icon" aria-hidden="true">
                      {emojiFor(e.category)}
                    </span>
                    {reserved > 0 && <span className="de-reg">Registered ✓</span>}
                  </div>

                  <div className="de-body">
                    <span className="de-pill">{e.category}</span>
                    <h3>{e.name}</h3>

                    <p className="de-line">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M3 10h18M8 3v4M16 3v4" />
                      </svg>
                      {fmtFull(e.date)}
                    </p>
                    <p className="de-line">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {e.venue} · {e.city}
                    </p>

                    <div className="de-foot">
                      <span className="de-price">
                        <strong>{priceText(e.price)}</strong>
                        {e.price > 0 && <small>person</small>}
                      </span>
                      <span className={left === 0 ? 'de-full' : 'de-left'}>
                        {left === 0 ? 'Fully booked' : `${left} spots left`}
                      </span>
                    </div>

                    <button type="button" className="de-view" onClick={() => onOpenEvent(e.id)}>
                      View Event
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <h2 className="de-cat-title">Explore by category</h2>
        <div className="de-cats">
          {CATEGORIES.map((c) => {
            const n = upcoming.filter((e) => e.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className={`de-cat${sport === c.id ? ' is-active' : ''}`}
                aria-pressed={sport === c.id}
                onClick={() => setSport(sport === c.id ? 'all' : c.id)}
              >
                <span className="de-cat-icon" aria-hidden="true">
                  {c.emoji}
                </span>
                <span className="de-cat-text">
                  <strong>{c.label}</strong>
                  <small>
                    {n} event{n === 1 ? '' : 's'}
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <p className="de-note">CourtConnect · Book courts. Join events. Play together.</p>
      </div>

      {/* View calendar */}
      {calendarOpen && (
        <Modal title="Events calendar" onClose={() => setCalendarOpen(false)} width={360}>
          <p className="de-modal-note">Days with a dot have events. Pick a day to filter the list.</p>
          <CalendarGrid
            value={date}
            marked={upcoming.map((e) => e.date)}
            onSelect={(iso) => {
              setDate(iso);
              setCalendarOpen(false);
            }}
          />
          {date && (
            <p className="de-modal-note">
              Showing events on {fmtShort(date)}.
            </p>
          )}
        </Modal>
      )}

      {/* Create Event */}
      {createOpen && (
        <Modal title="Create Event" onClose={() => setCreateOpen(false)} width={480}>
          <form onSubmit={submit} noValidate>
            {fError && (
              <p className="de-error" role="alert">
                {fError}
              </p>
            )}

            <label className="de-field">
              <span>Event name</span>
              <input value={fName} placeholder="e.g. Sunday Doubles" onChange={(e) => setFName(e.target.value)} />
            </label>

            <div className="de-two">
              <label className="de-field">
                <span>Sport</span>
                <select value={fCategory} onChange={(e) => setFCategory(e.target.value as EventCategory)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="de-field">
                <span>Date</span>
                <DatePicker
                  block
                  value={fDate}
                  min={today}
                  format={fmtShort}
                  className="de-input"
                  ariaLabel="Event date"
                  onChange={(iso) => {
                    if (iso) setFDate(iso);
                  }}
                />
              </div>
            </div>

            <label className="de-field">
              <span>Time</span>
              <input value={fTime} onChange={(e) => setFTime(e.target.value)} />
            </label>

            <label className="de-field">
              <span>Where</span>
              <input value={fVenue} placeholder="e.g. Rally Badminton Club" onChange={(e) => setFVenue(e.target.value)} />
            </label>

            <label className="de-field">
              <span>Event picture (max 2 MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFImage(e.target.files?.[0] ?? null)}
                required
              />
            </label>

            <div className="de-two">
              <label className="de-field">
                <span>Price per person (₱)</span>
                <input type="number" min="0" value={fPrice} onChange={(e) => setFPrice(e.target.value)} />
              </label>
              <label className="de-field">
                <span>Spots</span>
                <input type="number" min="1" value={fSpots} onChange={(e) => setFSpots(e.target.value)} />
              </label>
            </div>

            <div className="de-modal-actions">
              <button type="button" className="de-btn-outline" onClick={() => setCreateOpen(false)} disabled={isCreating}>
                Cancel
              </button>
              <button type="submit" className="de-create" disabled={isCreating}>
                {isCreating ? 'Saving…' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}