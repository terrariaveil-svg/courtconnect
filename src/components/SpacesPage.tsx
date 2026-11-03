import VenueDetail from './VenueDetail';
import type { Booking } from './BookingForm';
import type { SpaceChoice } from './QuickBook';
import { spacesFor } from './spacesData';

type SpacesPageProps = {
  choice: SpaceChoice;
  onChoiceChange: (choice: SpaceChoice) => void;
  onBooked: (booking: Booking) => void;
  userName?: string;
  unreadCount: number;
  bookingCount: number;
  onHome: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  onOpenSpaces: () => void;
  onOpenEvents: () => void;
  onOpenNotifications: () => void;
};

export default function SpacesPage({
  choice,
  onBooked,
  userName,
  unreadCount,
  bookingCount,
  onHome,
  onOpenProfile,
  onOpenBookings,
  onOpenSpaces,
  onOpenEvents,
  onOpenNotifications,
}: SpacesPageProps) {
  // Court -> first court, Gym floor -> first gym space
  const facility = spacesFor(choice)[0];

  return (
    <VenueDetail
      key={facility.id}
      facility={facility}
      userName={userName}
      unreadCount={unreadCount}
      bookingCount={bookingCount}
      onBack={onHome}
      onOpenProfile={onOpenProfile}
      onOpenBookings={onOpenBookings}
      onOpenSpaces={onOpenSpaces}
      onOpenEvents={onOpenEvents}
      onOpenNotifications={onOpenNotifications}
      onRent={onBooked}
    />
  );
}