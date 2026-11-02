import { useEffect, useRef, useState } from 'react';
import './CalendarPicker.css';
import { fmtShort, fromISO, toISO, todayISO } from './appUtils';

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

// A month calendar. Used inside the picker pop-up and on its own.
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
      <div className="cal-head">
        <button type="button" className="cal-nav" aria-label="Previous month" onClick={() => shift(-1)}>
          ‹
        </button>
        <strong>
          {MONTHS[view.month]} {view.year}
        </strong>
        <button type="button" className="cal-nav" aria-label="Next month" onClick={() => shift(1)}>
          ›
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((d) => (
          <span className="cal-dow" key={d}>
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
              className={`cal-day${iso === today ? ' is-today' : ''}${iso === value ? ' is-selected' : ''}${markedSet.has(iso) ? ' is-marked' : ''}`}
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
export default function CalendarPicker({
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
    <div className={`cal-wrap${block ? ' cal-wrap-block' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={`cal-trigger ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className="cal-trigger-text">{value ? format(value) : placeholder}</span>
      </button>

      {open && (
        <div className={`cal-pop${align === 'right' ? ' cal-pop-right' : ''}`} role="dialog" aria-label="Calendar">
          <CalendarGrid
            value={value}
            min={min}
            marked={marked}
            onSelect={(iso) => {
              onChange(iso);
              setOpen(false);
            }}
          />
          <div className="cal-foot">
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