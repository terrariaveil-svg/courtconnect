import { useEffect } from 'react';
import './LoadingScreen.css';
import bannerImg from '../assets/tennis-court.png';

type LoadingScreenProps = {
  onDone: () => void;
  durationMs?: number;
};

const LETTERS = 'LOADING'.split('');
const DOTS = ['.', '.', '.', '.'];

// How long the loading screen stays, in milliseconds.
// 12000 = 12 seconds. Change this number to make it shorter or longer.
const DEFAULT_DURATION_MS = 12000;

export default function LoadingScreen({
  onDone,
  durationMs = DEFAULT_DURATION_MS,
}: LoadingScreenProps) {
  // Go to the next screen when the bar is full
  useEffect(() => {
    const id = window.setTimeout(onDone, durationMs + 300);
    return () => window.clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <div className="load-page" role="status" aria-live="polite" aria-label="Loading">
      <img src={bannerImg} alt="" className="load-bg" />
      <div className="load-shade" />

      <div className="load-center">
        <span className="load-spinner" aria-hidden="true" />

        <div className="load-text-wrap">
          <div className="load-text" aria-hidden="true">
            {LETTERS.map((letter, i) => (
              <span
                key={`l-${i}`}
                className="load-char"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}

            <span className="load-gap" />

            {DOTS.map((dot, i) => (
              <span
                key={`d-${i}`}
                className="load-char load-dot"
                style={{ animationDelay: `${(LETTERS.length + i) * 0.1}s` }}
              >
                {dot}
              </span>
            ))}
          </div>

          <div className="load-bar">
            <span className="load-bar-fill" style={{ animationDuration: `${durationMs}ms` }} />
          </div>
        </div>
      </div>
    </div>
  );
}