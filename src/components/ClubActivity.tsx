import { useEffect, useState } from 'react';
import './ClubActivity.css';

type ClubActivityProps = {
  onHome: () => void;
};

const MEMBERS = 68;

const AREAS = [
  { name: 'Gym floor', percent: 72, color: '#ff8a00' },
  { name: 'Courts', percent: 50, color: '#1a5c1a' },
  { name: 'Studios', percent: 30, color: '#1d5fe0' },
];

const START_DELAY_MS = 500; // bars sit empty for a moment, then start
const FILL_MS = 2200; // how long each bar takes to fill
const STAGGER_MS = 400; // delay between one bar and the next
const TOTAL_MS = START_DELAY_MS + FILL_MS + STAGGER_MS * (AREAS.length - 1);

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function ClubActivity({ onHome }: ClubActivityProps) {
  // 1) The bars: start at 0%, then grow to their value (CSS transition)
  const [go, setGo] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setGo(true), START_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  // 2) The numbers: count up in time with the bars
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (time: number) => {
      const e = Math.min(time - start, TOTAL_MS);
      setElapsed(e);
      if (e < TOTAL_MS) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const t = Math.max(0, elapsed - START_DELAY_MS);
  const members = Math.round(MEMBERS * easeOutCubic(clamp01(t / FILL_MS)));

  return (
    <div className="club-page">
      <div className="club-card">
        {/* Header */}
        <header className="club-header">
          <div>
            <p className="club-eyebrow">RIGHT NOW</p>
            <h1 className="club-title">Club Activity</h1>
          </div>

          <button type="button" className="club-home-btn" onClick={onHome}>
            HOME
          </button>
        </header>

        {/* Total checked in */}
        <section className="club-total" aria-live="polite">
          <span className="club-total-number">{members}</span>
          <span className="club-total-label">
            members
            <br />
            checked in
          </span>
        </section>

        {/* Busy areas */}
        <ul className="club-areas">
          {AREAS.map((area, index) => {
            const progress = easeOutCubic(clamp01((t - index * STAGGER_MS) / FILL_MS));
            const label = Math.round(area.percent * progress);

            return (
              <li className="club-area" key={area.name}>
                <p className="club-area-name">{area.name}</p>
                <div className="club-bar-row">
                  <div
                    className="club-track"
                    role="progressbar"
                    aria-label={area.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={area.percent}
                  >
                    <div
                      className="club-fill"
                      style={{
                        width: go ? `${area.percent}%` : '0%',
                        background: area.color,
                        transition: `width ${FILL_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${index * STAGGER_MS}ms`,
                      }}
                    />
                  </div>
                  <span className="club-percent">{label}%</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}