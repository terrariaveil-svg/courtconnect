
import { MapPin, Clock } from "lucide-react";

export interface Facility {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  image: string;
  description: string;
}

interface Props {
  facility: Facility;
  onBook: (facility: Facility) => void;
}

export default function AvailableSpaces({ facility, onBook }: Props) {
  return (
    <article className="facility-card">
      <div className="facility-image-wrap">
        <img className="facility-image" src={facility.image} alt={facility.name} />
        <span className="image-tag">{facility.type}</span>
      </div>

      <div className="facility-content">
        <div className="facility-title-row">
          <h3>{facility.name}</h3>
          <span className="available-dot" title="Available" />
        </div>

        <p className="location-line"><MapPin size={16} /> {facility.location}</p>
        <p className="facility-description">{facility.description}</p>

        <div className="facility-footer">
          <div>
            <strong className="price">₱{facility.price.toLocaleString()}</strong>
            <span className="price-unit"> / hour</span>
          </div>
          <button
            className="button button-primary button-small"
            onClick={() => onBook(facility)}
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}
