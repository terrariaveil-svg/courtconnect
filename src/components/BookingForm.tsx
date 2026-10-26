
import { useState } from "react";
import { X, CalendarDays } from "lucide-react";
import type { Facility } from "./AvailableSpaces";

export interface Booking {
  id: number;
  facility: Facility;
  customer: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Confirmed";
}

interface Props {
  facility: Facility;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
}

export default function BookingForm({ facility, onClose, onConfirm }: Props) {
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const start = Number(startTime.split(":")[0]) * 60 +
    Number(startTime.split(":")[1]);
  const end = Number(endTime.split(":")[0]) * 60 +
    Number(endTime.split(":")[1]);
  const hours = (end - start) / 60;
  const validTime = end > start;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validTime) {
      window.alert("End time must be later than start time.");
      return;
    }

    onConfirm({
      id: Date.now(),
      facility,
      customer: customer.trim(),
      date,
      startTime,
      endTime,
      status: "Confirmed",
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={21} />
        </button>

        <span className="eyebrow">RESERVE YOUR SPACE</span>
        <h2 id="booking-title">Book a Facility</h2>
        <p className="section-intro">{facility.name}</p>

        <form className="booking-form" onSubmit={submit}>
          <label>
            Your Full Name
            <input
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </label>

          <label>
            Booking Date
            <input
              type="date"
              value={date}
              min={new Date().toLocaleDateString("en-CA")}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <div className="time-grid">
            <label>
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </label>
            <label>
              End Time
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="booking-total">
            <span><CalendarDays size={17} /> Estimated total</span>
            <strong>
              {validTime ? `₱${(hours * facility.price).toLocaleString()}` : "Check time"}
            </strong>
          </div>

          <button className="button button-primary button-full" type="submit">
            Confirm Booking
          </button>
          <button className="button button-outline button-full" type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
