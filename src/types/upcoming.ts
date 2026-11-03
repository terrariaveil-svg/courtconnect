
import type { Booking } from "../components/BookingForm";
import type { SportEvent } from "../components/Events";

export type UpcomingItem =
  | {
      id: string;
      type: "court";
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      booking: Booking;
    }
  | {
      id: string;
      type: "event";
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      event: SportEvent;
    };
