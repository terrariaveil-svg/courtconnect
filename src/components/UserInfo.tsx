import './UserInfo.css';
import profileImg from '../assets/profile.jpeg';
import RecentVisited from './RecentVisited';
import type { Visit } from './recentVisits';

type UserInfoProps = {
  userName?: string;
  visits?: Visit[];
  onHome: () => void;
  onClearVisits?: () => void;
  onOpenVisit?: (visit: Visit) => void;
  onExplore?: () => void;
};

const profileDetails = {
  registered: 'JULY -28-2026',
  location: 'Meohao, Kidapawan city, Nort cotabato',
  workouts: 12,
  streak: 3,
  totalTime: '8h',
};

export default function UserInfo({
  userName = 'Alex Wassabi',
  visits = [],
  onHome,
  onClearVisits,
  onOpenVisit,
  onExplore,
}: UserInfoProps) {
  return (
    <div className="user-page">
      <div className="user-card">
        {/* Header */}
        <header className="user-header">
          <div className="user-header-left">
            <div className="user-photo">
              <img src={profileImg} alt={userName} className="user-photo-img" />
            </div>
            <div>
              <h1 className="user-name">{userName}</h1>
              <p className="user-registered">DATE REGISTERED: {profileDetails.registered}</p>
              <p className="user-location">{profileDetails.location}</p>
            </div>
          </div>

          <button type="button" className="user-home-btn" onClick={onHome}>
            HOME
          </button>
        </header>

        {/* Fitness overview */}
        <section className="user-section">
          <h2 className="user-section-title">Your Fitness Overview</h2>
          <div className="user-stats">
            <div className="user-stat">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
              </svg>
              <strong>{profileDetails.workouts}</strong>
              <span>Workouts</span>
            </div>

            <div className="user-stat">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" />
              </svg>
              <strong>{profileDetails.streak}</strong>
              <span>Day streak</span>
            </div>

            <div className="user-stat">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <strong>{profileDetails.totalTime}</strong>
              <span>Total time</span>
            </div>
          </div>
        </section>

        {/* Recent visited */}
        <RecentVisited
          visits={visits}
          onClear={onClearVisits}
          onExplore={onExplore}
          onOpen={onOpenVisit ? (id) => {
            const visit = visits.find((v) => v.id === id);
            if (visit) onOpenVisit(visit);
          } : undefined}
        />
      </div>
    </div>
  );
}