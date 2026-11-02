import './HomePage.css';
import logo from '../assets/courtconnect-logo.png';
import heroImg from '../assets/tennis-court.png';

type HomePageProps = {
  userName?: string;
  onSignOut?: () => void;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function HomePage({ userName = 'Alex', onSignOut }: HomePageProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="home-page">
      {/* Top bar */}
      <header className="home-nav">
        <div className="home-nav-brand">
          <img src={logo} alt="CourtConnect logo" className="home-nav-logo" />
          <span>PLAYR</span>
        </div>

        <div className="home-nav-right">
          <label className="home-search">
            <input type="text" placeholder="Find a Space" />
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </label>

          <button className="home-bell" aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </button>

          <div className="home-avatar">{userName.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      {/* Hero */}
      <main className="home-hero">
        <section className="home-left">
          <p className="home-date-label">
            {WEEKDAYS[now.getDay()]}, {MONTHS[now.getMonth()]}
          </p>
          <div className="home-date-boxes">
            <input readOnly value={pad(now.getMonth() + 1)} aria-label="Month" />
            <input readOnly value={pad(now.getDate())} aria-label="Day" />
            <input readOnly value={now.getFullYear()} aria-label="Year" />
          </div>

          <h1 className="home-greeting">
            {greeting}, {userName}.
          </h1>

          <p className="home-upnext">Up next</p>
          <h2 className="home-session">Tennis practice</h2>

          <ul className="home-details">
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              Today, 9:30–10:30 AM
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Court 02 · Downtown Club
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
                <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2.2.7 3.5 2.6 3.5 5.5" />
              </svg>
              With Jamie K.
            </li>
          </ul>

          <div className="home-actions">
            <button className="home-btn-details">View details</button>
            <button className="home-btn-signout" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        </section>

        <section className="home-right" style={{ backgroundImage: `url(${heroImg})` }}>
          <button className="home-quickbook">+Quick book</button>
        </section>
      </main>
    </div>
  );
}