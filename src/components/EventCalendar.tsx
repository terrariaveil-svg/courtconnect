import { useEffect, useRef, useState } from 'react';
import './EventCalendar.css';
import { fmtShort, fromISO, toISO, todayISO } from './eventsList';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type GridProps = {
  value: string | null;
  min?: string;
  marked?: string[];
  onSelect: (iso: string) => void;
};

// A month calendar. Days with an event get a small dot.
export function CalendarGrid({ value, min, marked = [], onSelect }: GridProps) {
  const start = value ? fromISO(value) : new Date();
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() });

  const today = todayISO();
  const markedSet = new Set(marked);

  const lead = new Date(view.year, view.month, 1).getDay();
  const total = new Date(view.year, view.month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(toISO(new Date(view.year, view.month, d)));

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <div>
      <div className="ec-head">
        <button type="button" className="ec-nav" aria-label="Previous month" onClick={() => shift(-1)}>
          ‹
        </button>
        <strong>
          {MONTHS[view.month]} {view.year}
        </strong>
        <button type="button" className="ec-nav" aria-label="Next month" onClick={() => shift(1)}>
          ›
        </button>
      </div>

      <div className="ec-grid">
        {WEEKDAYS.map((d) => (
          <span className="ec-dow" key={d}>
            {d}
          </span>
        ))}

        {cells.map((iso, i) =>
          iso === null ? (
            <span key={`blank-${i}`} />
          ) : (
            <button
              key={iso}
              type="button"
              className={`ec-day${iso === today ? ' is-today' : ''}${iso === value ? ' is-selected' : ''}${markedSet.has(iso) ? ' is-marked' : ''}`}
              disabled={min !== undefined && iso < min}
              aria-pressed={iso === value}
              aria-label={fmtShort(iso)}
              onClick={() => onSelect(iso)}
            >
              {Number(iso.slice(8))}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

type PickerProps = {
  value: string | null;
  onChange: (iso: string | null) => void;
  min?: string;
  marked?: string[];
  placeholder?: string;
  clearable?: boolean;
  block?: boolean;
  align?: 'left' | 'right';
  className?: string;
  format?: (iso: string) => string;
  ariaLabel?: string;
};

// A button that opens a calendar pop-up
export function DatePicker({
  value,
  onChange,
  min,
  marked,
  placeholder = 'Select date',
  clearable = false,
  block = false,
  align = 'left',
  className = '',
  format = fmtShort,
  ariaLabel = 'Choose a date',
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const today = todayISO();
  const canPickToday = min === undefined || today >= min;

  return (
    <div className={`ec-wrap${block ? ' ec-wrap-block' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={`ec-trigger ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? format(value) : placeholder}
      </button>

      {open && (
        <div className={`ec-pop${align === 'right' ? ' ec-pop-right' : ''}`} role="dialog" aria-label="Calendar">
          <CalendarGrid
            value={value}
            min={min}
            marked={marked}
            onSelect={(iso) => {
              onChange(iso);
              setOpen(false);
            }}
          />
          <div className="ec-foot">
            {canPickToday ? (
              <button
                type="button"
                onClick={() => {
                  onChange(today);
                  setOpen(false);
                }}
              >
                Today
              </button>
            ) : (
              <span />
            )}
            {clearable && value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}