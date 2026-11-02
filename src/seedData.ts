import type { AppBooking } from './appTypes';
import { ALL_VENUES, courtLabelFor } from './venues';
import { addDaysISO, todayISO } from './appUtils';

function make(
  id: number,
  venueId: number,
  dayOffset: number,
  startHour: number,
  endHour: number,
  refNumber: number,
  cancelled = false,
): AppBooking {
  const v = ALL_VENUES.find((x) => x.id === venueId) ?? ALL_VENUES[0];
  return {
    id,
    ref: `CC-${new Date().getFullYear()}-${String(refNumber).padStart(4, '0')}`,
    venueId: v.id,
    venueName: v.name,
    venueImage: v.image,
    location: v.location,
    sport: v.sport,
    indoor: v.indoor,
    courtLabel: courtLabelFor(v, startHour),
    date: addDaysISO(todayISO(), dayOffset),
    startHour,
    endHour,
    pricePerHour: v.price,
    customer: 'Alex Wassabi',
    email: 'alex@example.com',
    payment: 'Bank Transfer',
    players: 'Up to 10',
    cancelled,
  };
}

// A few sample bookings so My Bookings has something to show
export function seedBookings(): AppBooking[] {
  return [
    make(1, 3, 1, 8, 9, 12),
    make(2, 4, 3, 16, 18, 13),
    make(3, 1, -5, 18, 19, 9),
    make(4, 2, -9, 10, 11, 8),
    make(5, 3, -3, 14, 15, 10, true),
  ];
}