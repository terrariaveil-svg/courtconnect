
import { ArrowRight, CalendarDays } from "lucide-react";

interface HeroProps {
  onExplore: () => void;
  onEvents: () => void;
}

export default function Hero({ onExplore, onEvents }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">YOUR GAME STARTS HERE</span>
        <h1>
          Find Your Court.
          <br />
          <span className="green">Play Your Game.</span>
        </h1>
        <p>
          Discover sports facilities, check availability, and book your
          next game with CourtConnect.
        </p>

        <div className="hero-actions">
          <button className="button button-primary" onClick={onExplore}>
            Explore Facilities <ArrowRight size={18} />
          </button>
          <button className="button button-outline" onClick={onEvents}>
            <CalendarDays size={18} /> Browse Events
          </button>
        </div>

        <div className="hero-stats">
          <div><strong>Easy</strong><span>Online Booking</span></div>
          <div><strong>Anytime</strong><span>Check Availability</span></div>
          <div><strong>All Sports</strong><span>One Platform</span></div>
        </div>
      </div>

      <div className="hero-visual">
        <img
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=85"
          alt="Indoor basketball court"
        />
        <div className="hero-floating-card">
          <span className="available-dot" />
          <div><strong>Ready to play?</strong><p>Find your next game today.</p></div>
        </div>
      </div>
    </section>
  );
}
