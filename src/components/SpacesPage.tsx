import AvailableSpaces from './AvailableSpaces';
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
};

export default function SpacesPage({
  choice,
  onBooked,
  userName,
  unreadCount,
  onHome,
  onOpenProfile,
  onOpenBookings,
}: SpacesPageProps) {
  // Court -> Rally Badminton Club, Gym floor -> the gym space
  const facility = spacesFor(choice)[0];

  return (
    <AvailableSpaces
      key={facility.id}
      facility={facility}
      userName={userName}
      unreadCount={unreadCount}
      onBack={onHome}
      onOpenProfile={onOpenProfile}
      onOpenBookings={onOpenBookings}
      onRent={onBooked}
    />
  );
}