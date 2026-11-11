import VenueDetail from "./VenueDetail";
import type { Booking } from "./BookingForm";

export interface Facility {
  id: number;
  ownerId?: string | null;
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
  onRent?: (booking: Booking) => void | Promise<void>;
  userName?: string;
  unreadCount?: number;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenBookings?: () => void;
}


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
      key={facility.id}
      facility={facility}
      userName={userName}
      unreadCount={unreadCount}
      onBack={onBack}
      onOpenProfile={onOpenProfile}
      onOpenBookings={onOpenBookings}
      onRent={(booking) => {
        if (onRent) {
          return onRent(booking);
        } else {
          onBook?.(facility);
        }
      }}
    />
  );
}