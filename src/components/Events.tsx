
import { CalendarDays } from "lucide-react";

export interface SportEvent {
  id: number;
  name: string;
  category: string;
  date: string;
  price: number;
  image: string;
}

interface EventsProps {
  events: SportEvent[];
  onRegister: (event: SportEvent) => void;
}

export default function Events({
  events = [],
  onRegister,
}: EventsProps) {
  return (
    <section className="events-section">
      <div className="events-header">
        <div>
          <h2>Upcoming Events</h2>
          <p>Discover and join upcoming sports events.</p>
        </div>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p>No upcoming events available.</p>
        ) : (
          events.map((event) => (
            <div className="event-card" key={event.id}>
              <img
                src={event.image}
                alt={event.name}
                className="event-image"
              />

              <div className="event-content">
                <span className="event-category">
                  {event.category}
                </span>

                <h3>{event.name}</h3>

                <p className="event-date">
                  <CalendarDays size={16} />
                  {event.date}
                </p>

                <p className="event-price">
                  {event.price === 0
                    ? "Free"
                    : `₱${event.price.toLocaleString()}`}
                </p>

                <button
                  className="register-button"
                  onClick={() => onRegister(event)}
                >
                  Register
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
