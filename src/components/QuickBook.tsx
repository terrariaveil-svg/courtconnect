import { useEffect, useRef, useState } from 'react';
import './QuickBook.css';

export type SpaceChoice = 'court' | 'gym';

type QuickBookProps = {
  onClose: () => void;
  onShowSpaces: (choice: SpaceChoice) => void;
};

type Option = {
  id: SpaceChoice;
  label: string;
  count: string;
};

const OPTIONS: Option[] = [
  { id: 'court', label: 'Reserved Court', count: '6 spaces open' },
  { id: 'gym', label: 'Gym floor', count: '18 spots' },
];

function CourtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 12h16M12 3v18M4 7.5h4v9H4M20 7.5h-4v9h4" />
    </svg>
  );
}

function GymIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />
    </svg>
  );
}

export default function QuickBook({ onClose, onShowSpaces }: QuickBookProps) {
  const [choice, setChoice] = useState<SpaceChoice>('court');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close with the Escape key, and focus the pop-up when it opens
  useEffect(() => {
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="qb-backdrop" onMouseDown={onClose}>
      <div
        className="qb-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qb-heading"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="qb-close" aria-label="Close quick book" onClick={onClose}>
          ×
        </button>

        <p className="qb-eyebrow">Quick book</p>
        <h2 className="qb-title" id="qb-heading">
          What are you playing?
        </h2>

        <div className="qb-options" role="radiogroup" aria-label="What are you playing?">
          {OPTIONS.map((option) => {
            const selected = choice === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`qb-card qb-card-${option.id}${selected ? ' is-selected' : ''}`}
                onClick={() => setChoice(option.id)}
              >
                {selected && (
                  <span className="qb-check" aria-hidden="true">
                    ✓
                  </span>
                )}
                <span className="qb-card-icon">
                  {option.id === 'court' ? <CourtIcon /> : <GymIcon />}
                </span>
                <span className="qb-card-label">{option.label}</span>
                <span className="qb-card-count">{option.count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="qb-show"
          onClick={() => onShowSpaces(choice)}
        >
          Show available Space
        </button>
      </div>
    </div>
  );
}