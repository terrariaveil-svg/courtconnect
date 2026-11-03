import { useState } from 'react';
import VenueDetail from './VenueDetail';
import type { Booking } from './BookingForm';
import type { Facility } from './AvailableSpaces';
import type { SpaceChoice } from './QuickBook';
import { spacesFor } from './spacesData';

type SpacesPageProps = {
  choice: SpaceChoice;
  customCourts: Facility[];
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
  customCourts,
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
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const facilities = [
    ...spacesFor(choice),
    ...(choice === 'court' ? customCourts : []),
  ];
  const facility = facilities.find((item) => item.id === selectedFacilityId) ?? facilities[0];

  return (
    <VenueDetail
      key={facility.id}
      facility={facility}
      facilities={facilities}
      onSelectFacility={setSelectedFacilityId}
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