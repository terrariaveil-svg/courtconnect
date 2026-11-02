import { useState } from 'react';
import './ui.css';
import './BookCourtPage.css';
import AppNav from './AppNav';
import CalendarPicker from './CalendarPicker';
import type { AppBooking, NavProps } from './appTypes';
import type { Venue } from './venues';
import { takenByOthers } from './venues';
import { fmtHour, fmtWeekday, hasConflict, todayISO } from './appUtils';

export type BookingDraft = { venue: Venue; date: string; startHour: number };

export type BookingFormData = {
  date: string;
  startHour: number;
  endHour: number;
  customer: string;
};

type BookCourtPageProps = {
  nav: NavProps;
  draft: BookingDraft;
  bookings: AppBooking[];
  defaultName: string;
  onBack: () => void;
  onConfirm: (form: BookingFormData) => void;
};

const START_HOURS = Array.from({ length: 15 }, (_, i) => 6 + i); // 06:00 AM - 08:00 PM

export default function BookCourtPage({
  nav,
  draft,
  bookings,
  defaultName,
  onBack,
  onConfirm,
}: BookCourtPageProps) {
  const { venue } = draft;
  const [date, setDate] = useState(draft.date);
  const [startHour, setStartHour] = useState(draft.startHour);
  const [endHour, setEndHour] = useState(draft.startHour + 1);
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  const endOptions = Array.from({ length: 21 - startHour }, (_, i) => startHour + 1 + i);
  const hours = endHour - startHour;
  const total = venue.price * hours;

  const validate = (): string => {
    if (!name.trim()) return 'Please enter your name.';
    if (!date) return 'Please choose a date.';
    const today = todayISO();
    if (date < today) return 'That date has already passed.';
    if (date === today && startHour <= new Date().getHours()) {
      return 'That start time has already passed. Pick a later time.';
    }
    if (endHour <= startHour) return 'The end time must be after the start time.';
    if (hasConflict(bookings, venue.id, date, startHour, endHour)) {
      return 'You already have a booking for this space at that time.';
    }
    for (let h = startHour; h < endHour; h++) {
      if (takenByOthers(venue.id, date, h)) {
        return `${fmtHour(h)} is already taken. Try another time or date.`;
      }
    }
    return '';
  };

  const submit = () => {
    const problem = validate();
    setError(problem);
    if (problem) return;
    onConfirm({ date, startHour, endHour, customer: name.trim() });
  };

  return (
    <div className="app-page">
      <AppNav {...nav} active="spaces" />

      <main className="app-main bk-main">
        <section className="bk-card ui-card">
          <button type="button" className="app-crumb" onClick={onBack}>
            ‹ Back
          </button>
          <h1 className="app-title">Book a Court</h1>

          <div className="bk-venue">
            <img src={venue.image} alt="" className="bk-venue-img" />
            <div className="bk-venue-info">
              <strong>{venue.name}</strong>
              <span className="bk-venue-meta">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
                {venue.indoor ? 'Indoor' : 'Outdoor'} · ₱{venue.price} / hour
              </span>
              <span className="ui-pill ui-pill-green">Available</span>
            </div>
          </div>

          {error && (
            <p className="ui-error" role="alert">
              {error}
            </p>
          )}

          <div className="bk-field">
            <span className="ui-label">Select Date</span>
            <CalendarPicker
              block
              value={date}
              min={todayISO()}
              format={fmtWeekday}
              ariaLabel="Select date"
              onChange={(iso) => {
                if (iso) setDate(iso);
                setError('');
              }}
            />
          </div>

          <div className="bk-field">
            <span className="ui-label">Select Time</span>
            <div className="bk-times">
              <label>
                <span className="bk-small">Start Time</span>
                <select
                  className="ui-select"
                  value={startHour}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setStartHour(next);
                    if (endHour <= next) setEndHour(next + 1);
                    setError('');
                  }}
                >
                  {START_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {fmtHour(h)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="bk-small">End Time</span>
                <select
                  className="ui-select"
                  value={endHour}
                  onChange={(e) => {
                    setEndHour(Number(e.target.value));
                    setError('');
                  }}
                >
                  {endOptions.map((h) => (
                    <option key={h} value={h}>
                      {fmtHour(h)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="bk-field">
            <label>
              <span className="ui-label">Your Name</span>
              <input
                className="ui-input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
              />
            </label>
          </div>

          <div className="bk-total">
            <span>
              {hours} hour{hours === 1 ? '' : 's'} × ₱{venue.price}
            </span>
            <strong>Total ₱{total}</strong>
          </div>

          <button type="button" className="ui-btn ui-btn-primary ui-btn-block" onClick={submit}>
            Confirm Booking
          </button>
        </section>
      </main>
    </div>
  );
}