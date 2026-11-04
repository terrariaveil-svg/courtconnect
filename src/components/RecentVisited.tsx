
import './RecentVisited.css';
import type { Visit } from './recentVisits';
import { fmtVisitDate } from './recentVisits';

type RecentVisitedProps = {
  visits: Visit[];
  onOpen?: (id: number) => void;
  onClear?: () => void;
  onExplore?: () => void;
};

export default function RecentVisited({ visits, onOpen, onClear, onExplore }: RecentVisitedProps) {
  return (
    <section className="user-section">
      <div className="rv-head">
        <h2 className="user-section-title user-recent-title">Recent Visited:</h2>
        {visits.length > 0 && onClear && (
          <button type="button" className="rv-clear" onClick={onClear}>
            Clear history
          </button>
        )}
      </div>

      {visits.length === 0 ? (
        <div className="rv-empty">
          <p>No visits yet. Spaces you book will show up here.</p>
          {onExplore && (
            <button type="button" onClick={onExplore}>
              Find a space
            </button>
          )}
        </div>
      ) : (
        <ul className="rv-list">
          {visits.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                className="rv-item"
                disabled={!onOpen}
                onClick={() => onOpen?.(v.id)}
                aria-label={`${v.name}, last visited ${fmtVisitDate(v.visitedAt)}`}
              >
                <img src={v.image} alt="" className="rv-photo" />
                <span className="rv-text">
                  <span className="rv-name">{v.name}</span>
                  <span className="rv-date">Last visited: {fmtVisitDate(v.visitedAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
