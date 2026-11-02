import VenueDetail from "./VenueDetail";
import type { Booking } from "./BookingForm";

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
  onBook?: (facility: Facility) => void;
  onRent?: (booking: Booking) => void;
  userName?: string;
  unreadCount?: number;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenBookings?: () => void;
}

// The Available Spaces page: the full venue layout from the Figma design
export default function AvailableSpaces({
  facility,
  onBook,
  onRent,
  userName,
  unreadCount = 0,
  onBack = () => undefined,
  onOpenProfile = () => undefined,
  onOpenBookings = () => undefined,
}: Props) {
  return (
    <VenueDetail
      facility={facility}
      userName={userName}
      unreadCount={unreadCount}
      onBack={onBack}
      onOpenProfile={onOpenProfile}
      onOpenBookings={onOpenBookings}
      onRent={(booking) => {
        if (onRent) {
          onRent(booking);
        } else {
          onBook?.(facility);
        }
      }}
    />
  );
}