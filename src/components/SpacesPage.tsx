import { useState } from 'react';
import VenueDetail from './VenueDetail';
import type { Booking } from './BookingForm';
import type { Facility } from './AvailableSpaces';
import type { SpaceChoice } from './QuickBook';
import { spacesFor } from './spacesData';

type SpacesPageProps = {
  choice: SpaceChoice;
  customCourts: Facility[];
  initialFacilityId?: number | null;
  onFacilityViewed: (facility: Facility) => void;
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
  initialFacilityId,
  onFacilityViewed,
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
  const facilities = [
    ...spacesFor(choice),
    ...(choice === 'court' ? customCourts : []),
  ];

  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(
    initialFacilityId ?? null,
  );

  const facility =
    facilities.find((item) => item.id === selectedFacilityId) ??
    facilities[0];

  if (!facility) {
    return <div>No available facilities found.</div>;
  }

  return (
    <VenueDetail
      key={facility.id}
      facility={facility}
      facilities={facilities}
      onSelectFacility={setSelectedFacilityId}
      onFacilityViewed={onFacilityViewed}
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