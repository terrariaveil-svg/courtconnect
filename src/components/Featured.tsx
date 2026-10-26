
import { ArrowRight } from "lucide-react";
import AvailableSpaces, { type Facility } from "./AvailableSpaces";

interface Props {
  facilities: Facility[];
  onBook: (facility: Facility) => void;
  onViewAll: () => void;
}

export default function Featured({ facilities, onBook, onViewAll }: Props) {
  return (
    <section className="section-block" id="featured">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIND YOUR PLAYGROUND</span>
          <h2>Featured Facilities</h2>
          <p>Explore courts and sports spaces ready for your next game.</p>
        </div>
        <button className="text-link" onClick={onViewAll}>
          View all <ArrowRight size={17} />
        </button>
      </div>

      <div className="facility-grid">
        {facilities.slice(0, 3).map((facility) => (
          <AvailableSpaces
            key={facility.id}
            facility={facility}
            onBook={onBook}
          />
        ))}
      </div>
    </section>
  );
}
