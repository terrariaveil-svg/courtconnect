import { useState } from 'react';
import type { FormEvent } from 'react';
import './ui.css';
import './EventsPage.css';
import AppNav from './AppNav';
import CalendarPicker, { CalendarGrid } from './CalendarPicker';
import ModalShell from './ModalShell';
import type { NavProps } from './appTypes';
import { CATEGORIES, emojiFor, eventMatches } from './eventsData';
import type { ClubEvent, EventCategory } from './eventsData';
import { addDaysISO, fmtWeekday, todayISO } from './appUtils';

export type NewEvent = Omit<ClubEvent, 'id' | 'registered'>;

type EventsPageProps = {
  nav: NavProps;
  events: ClubEvent[];
  initialEventId?: number | null;
  onToggleRegister: (id: number) => void;
  onCreate: (event: NewEvent) => void;
};

const TINT: Record<EventCategory, string> = {
  Badminton: '#dcf1e4',
  Basketball: '#e1e6fb',
  Fitness: '#fae8d8',
  Tournament: '#fbf0c9',
};

const priceText = (price: number): string => (price === 0 ? 'Free' : `₱${price}`);

export default function EventsPage({
  nav,
  events,
  initialEventId = null,
  onToggleRegister,
  onCreate,
}: EventsPageProps) {
  const today = todayISO();

  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<'all' | EventCategory>('all');
  const [date, setDate] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(initialEventId);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Create-event form
  const [fName, setFName] = useState('');
  const [fCategory, setFCategory] = useState<EventCategory>('Badminton');
  const [fDate, setFDate] = useState<string>(addDaysISO(today, 7));
  const [fVenue, setFVenue] = useState('');
  const [fPrice, setFPrice] = useState('0');
  const [fSpots, setFSpots] = useState('20');
  const [fError, setFError] = useState('');

  const upcoming = events.filter((e) => e.date >= today);

  const visible = upcoming
    .filter((e) => !query.trim() || eventMatches(e, query))
    .filter((e) => sport === 'all' || e.category === sport)
    .filter((e) => !date || e.date === date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const selected = events.find((e) => e.id === selectedId) ?? null;
  const filtersOn = query.trim() !== '' || sport !== 'all' || date !== null;

  const clearFilters = () => {
    setQuery('');
    setSport('all');
    setDate(null);
  };

  const submitCreate = (e: FormEvent) => {
    e.preventDefault();
    const price = Number(fPrice);
    const spots = Number(fSpots);
    if (!fName.trim()) return setFError('Please enter an event name.');
    if (!fVenue.trim()) return setFError('Please enter where the event is held.');
    if (!fDate || fDate < today) return setFError('Please choose a date that is today or later.');
    if (!Number.isFinite(price) || price < 0) return setFError('Price must be 0 or more.');
    if (!Number.isInteger(spots) || spots < 1) return setFError('Spots must be at least 1.');

    onCreate({
      name: fName.trim(),
      category: fCategory,
      date: fDate,
      venue: fVenue.trim(),
      city: 'Kidapawan City',
      price,
      spotsLeft: spots,
      description: `${fName.trim()} is open to everyone. Register to save your spot.`,
    });
    clearFilters();
    setCreateOpen(false);
    setFName('');
    setFVenue('');
    setFError('');
  };

  return (
    <div className="app-page">
      <AppNav {...nav} active="events" />

      <main className="app-main">
        <h1 className="app-title">Discover Events</h1>
        <p className="app-sub">Find competitions, sports meetups, and activities near you.</p>

        <div className="ev-filters">
          <label className="ev-search ui-card">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="ev-select ui-card"
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

          <CalendarPicker
            value={date}
            onChange={setDate}
            marked={upcoming.map((e) => e.date)}
            placeholder="Any date"
            clearable
            align="right"
            className="ev-date"
            format={fmtWeekday}
            ariaLabel="Filter by date"
          />

          <button type="button" className="ui-btn ui-btn-primary" onClick={() => setCreateOpen(true)}>
            + Create Event
          </button>
        </div>

        <div className="ev-heading">
          <h2>Upcoming events</h2>
          <button type="button" className="ev-link" onClick={() => setCalendarOpen(true)}>
            View calendar
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="ui-empty">
            <h3>No events found</h3>
            <p>{filtersOn ? 'Try a different search, sport or date.' : 'There are no upcoming events yet.'}</p>
            {filtersOn ? (
              <button type="button" className="ui-btn ui-btn-outline" onClick={clearFilters}>
                Clear filters
              </button>
            ) : (
              <button type="button" className="ui-btn ui-btn-primary" onClick={() => setCreateOpen(true)}>
                Create an event
              </button>
            )}
          </div>
        ) : (
          <div className="ev-grid">
            {visible.map((e) => (
              <article className="ev-card ui-card" key={e.id}>
                <div className="ev-cover" style={{ background: TINT[e.category] }}>
                  <span className="ev-emoji" aria-hidden="true">
                    {emojiFor(e.category)}
                  </span>
                  {e.registered && <span className="ui-pill ui-pill-green ev-reg">Registered ✓</span>}
                </div>

                <div className="ev-body">
                  <span className="ui-pill ui-pill-green">{e.category}</span>
                  <h3>{e.name}</h3>
                  <p className="ev-line">{fmtWeekday(e.date)}</p>
                  <p className="ev-line">
                    {e.venue} · {e.city}
                  </p>

                  <div className="ev-foot">
                    <strong>
                      {priceText(e.price)}
                      {e.price > 0 && <small> /person</small>}
                    </strong>
                    <span className={e.spotsLeft === 0 ? 'ev-full' : ''}>
                      {e.spotsLeft === 0 ? 'Fully booked' : `${e.spotsLeft} spots left`}
                    </span>
                  </div>

                  <button type="button" className="ui-btn ui-btn-primary ui-btn-block" onClick={() => setSelectedId(e.id)}>
                    View Event
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <h2 className="ev-cat-title">Explore by category</h2>
        <div className="ev-cats">
          {CATEGORIES.map((c) => {
            const n = upcoming.filter((e) => e.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className={`ev-cat ui-card${sport === c.id ? ' is-active' : ''}`}
                onClick={() => setSport(sport === c.id ? 'all' : c.id)}
                aria-pressed={sport === c.id}
              >
                <span className="ev-cat-icon" aria-hidden="true">
                  {c.emoji}
                </span>
                <span>
                  <strong>{c.label}</strong>
                  <small>
                    {n} event{n === 1 ? '' : 's'}
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <p className="ev-foot-note">CourtConnect · Book courts. Join events. Play together.</p>
      </main>

      {/* Event details */}
      {selected && (
        <ModalShell title={selected.name} onClose={() => setSelectedId(null)} width={460}>
          <div className="ev-modal-cover" style={{ background: TINT[selected.category] }}>
            <span aria-hidden="true">{emojiFor(selected.category)}</span>
          </div>
          <span className="ui-pill ui-pill-green">{selected.category}</span>
          <p className="ev-modal-desc">{selected.description}</p>
          <dl className="ev-modal-facts">
            <div>
              <dt>Date</dt>
              <dd>{fmtWeekday(selected.date)}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>
                {selected.venue} · {selected.city}
              </dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{selected.price === 0 ? 'Free' : `₱${selected.price} per person`}</dd>
            </div>
            <div>
              <dt>Spots left</dt>
              <dd>{selected.spotsLeft}</dd>
            </div>
          </dl>
          <div className="ui-modal-actions">
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setSelectedId(null)}>
              Close
            </button>
            {selected.registered ? (
              <button type="button" className="ui-btn ui-btn-danger" onClick={() => onToggleRegister(selected.id)}>
                Cancel registration
              </button>
            ) : (
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                disabled={selected.spotsLeft === 0}
                onClick={() => onToggleRegister(selected.id)}
              >
                {selected.spotsLeft === 0 ? 'Fully booked' : 'Register'}
              </button>
            )}
          </div>
        </ModalShell>
      )}

      {/* Calendar view */}
      {calendarOpen && (
        <ModalShell title="Events calendar" onClose={() => setCalendarOpen(false)} width={360}>
          <p className="ev-cal-note">Days with a dot have events. Pick a day to filter the list.</p>
          <CalendarGrid
            value={date}
            marked={upcoming.map((e) => e.date)}
            onSelect={(iso) => {
              setDate(iso);
              setCalendarOpen(false);
            }}
          />
        </ModalShell>
      )}

      {/* Create event */}
      {createOpen && (
        <ModalShell title="Create Event" onClose={() => setCreateOpen(false)} width={480}>
          <form onSubmit={submitCreate} noValidate>
            {fError && (
              <p className="ui-error" role="alert">
                {fError}
              </p>
            )}

            <label className="ev-field">
              <span className="ui-label">Event name</span>
              <input className="ui-input" value={fName} placeholder="e.g. Sunday Doubles" onChange={(e) => setFName(e.target.value)} />
            </label>

            <div className="ev-two">
              <label className="ev-field">
                <span className="ui-label">Sport</span>
                <select className="ui-select" value={fCategory} onChange={(e) => setFCategory(e.target.value as EventCategory)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ev-field">
                <span className="ui-label">Date</span>
                <CalendarPicker
                  block
                  value={fDate}
                  min={today}
                  format={fmtWeekday}
                  ariaLabel="Event date"
                  onChange={(iso) => {
                    if (iso) setFDate(iso);
                  }}
                />
              </div>
            </div>

            <label className="ev-field">
              <span className="ui-label">Where</span>
              <input className="ui-input" value={fVenue} placeholder="e.g. Rally Badminton Club" onChange={(e) => setFVenue(e.target.value)} />
            </label>

            <div className="ev-two">
              <label className="ev-field">
                <span className="ui-label">Price per person (₱)</span>
                <input className="ui-input" type="number" min="0" value={fPrice} onChange={(e) => setFPrice(e.target.value)} />
              </label>
              <label className="ev-field">
                <span className="ui-label">Spots</span>
                <input className="ui-input" type="number" min="1" value={fSpots} onChange={(e) => setFSpots(e.target.value)} />
              </label>
            </div>

            <div className="ui-modal-actions">
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="ui-btn ui-btn-primary">
                Create Event
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}