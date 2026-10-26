
import { CalendarDays, MapPin } from "lucide-react";

export interface SportEvent {
  id: number;
  name: string;
  category: string;
  date: string;
  price: number;
  image: string;
}

interface Props {
  events: SportEvent[];
}

export default function Events({ events }: Props) {
  return (
    <section className="page-section">
      <span className="eyebrow">PLAY TOGETHER</span>
      <h2>Upcoming Sports Events</h2>
      <p className="section-intro">
        Discover local games, tournaments, and activities.
      </p>

      <div className="facility-grid">
        {events.map((event) => (
          <article className="facility-card" key={event.id}>
            <div className="facility-image-wrap">
              <img className="facility-image" src={event.image} alt={event.name} />
              <span className="image-tag">{event.category}</span>
            </div>
            <div className="facility-content">
              <h3>{event.name}</h3>
              <p className="location-line">
                <CalendarDays size={16} /> {event.date}
              </p>
              <p className="location-line">
                <MapPin size={16} /> CourtConnect Sports Complex
              </p>
              <div className="facility-footer">
                <strong className="price">
                  {event.price === 0 ? "Free" : `₱${event.price.toLocaleString()}`}
                </strong>
                <button
                  className="button button-primary button-small"
                  onClick={() => window.alert(`You selected ${event.name}. Event registration can be connected next.`)}
                >
                  View Event
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
