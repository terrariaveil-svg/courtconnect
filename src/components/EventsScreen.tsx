import type { MouseEvent } from 'react';
import Events from './Events';
import type { SportEvent } from './Events';

type EventsScreenProps = {
  events: SportEvent[];
  onOpenEvent: (id: number) => void;
};

// Shows your friend's events list and makes each "View Event" button open that event
export default function EventsScreen({ events, onOpenEvent }: EventsScreenProps) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('button, a');
    if (!button || button.textContent?.trim() !== 'View Event') return;

    const card = button.closest('.event-card, article');
    const title = card?.querySelector('h3')?.textContent?.trim();
    const match = events.find((ev) => ev.name === title);
    if (match) onOpenEvent(match.id);
  };

  return (
    <div onClick={handleClick}>
      <Events events={events} />
    </div>
  );
}