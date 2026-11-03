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

export function bookingEndDate(booking: Booking): Date | undefined {
  const minutes = toMinutes(booking.endTime);
  if (!Number.isFinite(minutes)) return undefined;

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(booking.date);
  const endDate = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(booking.date);

  if (Number.isNaN(endDate.getTime())) return undefined;

  endDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return endDate;
}

export function hasBookingEnded(booking: Booking, now: Date): boolean {
  const endDate = bookingEndDate(booking);
  return endDate !== undefined && endDate.getTime() <= now.getTime();
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
