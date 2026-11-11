import type { Booking } from './BookingForm';
import { bookingDurationMinutes } from './bookingAvailability';

export type FitnessOverview = {
  workouts: number;
  streak: number;
  totalMinutes: number;
};

function dayNumber(date: string): number | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return undefined;
  }

  return Math.floor(parsed.getTime() / 86_400_000);
}

export function getFitnessOverview(
  bookings: Booking[],
  now: Date = new Date(),
): FitnessOverview {
  const completedBookings = bookings.filter(
    (booking) => booking.status === 'Done',
  );
  const gymBookings = completedBookings.filter(
    (booking) => booking.facility.type.toLowerCase() === 'gym floor',
  );
  const gymDays = [
    ...new Set(
      gymBookings
        .map((booking) => dayNumber(booking.date))
        .filter((day): day is number => day !== undefined),
    ),
  ].sort((a, b) => b - a);

  let streak = 0;
  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ) / 86_400_000;

  if (gymDays.length > 0 && today - gymDays[0] <= 1) {
    let expectedDay = gymDays[0];
    for (const day of gymDays) {
      if (day !== expectedDay) break;
      streak += 1;
      expectedDay -= 1;
    }
  }

  return {
    workouts: gymBookings.length,
    streak,
    totalMinutes: completedBookings.reduce(
      (total, booking) => total + bookingDurationMinutes(booking),
      0,
    ),
  };
}

export function formatTotalTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
