import type { Booking } from './BookingForm';

function toMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(time.trim());
  if (!match) return Number.NaN;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (minutes > 59 || hours > (period ? 12 : 23) || (period && hours === 0)) {
    return Number.NaN;
  }

  if (period) {
    hours = hours % 12 + (period === 'PM' ? 12 : 0);
  }

  return hours * 60 + minutes;
}

export function findConfirmedBookingConflict(
  candidate: Booking,
  bookings: Booking[],
): Booking | undefined {
  const candidateStart = toMinutes(candidate.startTime);
  const candidateEnd = toMinutes(candidate.endTime);

  if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateEnd)) {
    return undefined;
  }

  return bookings.find((booking) => {
    if (
      booking.id === candidate.id ||
      booking.status !== 'Confirmed' ||
      booking.facility.id !== candidate.facility.id ||
      booking.date !== candidate.date
    ) {
      return false;
    }

    const bookedStart = toMinutes(booking.startTime);
    const bookedEnd = toMinutes(booking.endTime);

    return (
      Number.isFinite(bookedStart) &&
      Number.isFinite(bookedEnd) &&
      candidateStart < bookedEnd &&
      bookedStart < candidateEnd
    );
  });
}
