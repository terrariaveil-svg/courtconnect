import { useState, type FormEvent } from 'react';
import './AdminDashboard.css';
import type { Booking } from './BookingForm';
import type { ApprovalStatus } from './approval';
import type { ClubEvent } from './eventsList';
import { findConfirmedBookingConflict } from './bookingAvailability';
import type { Facility } from './AvailableSpaces';
import type { CourtRequest, CourtRequestStatus } from './courtRequests';

type AdminDashboardProps = {
  bookings: Booking[];
  courts: Facility[];
  courtRequests: CourtRequest[];
  courtStorageError: string;
  courtRequestStorageError: string;
  events: ClubEvent[];
  registrations: Record<number, number>;
  registrationStatuses: Record<number, ApprovalStatus>;
  onAddCourt: (court: Omit<Facility, 'id'>) => boolean | Promise<boolean>;
  onDeleteCourt: (id: number) => boolean | Promise<boolean>;
  onCourtRequestStatusChange: (
    id: number,
    status: CourtRequestStatus,
  ) => boolean | Promise<boolean>;
  onRefreshData: () => Promise<void>;
  onImportLegacy: () => Promise<void>;
  importStatus: string;
  onBookingStatusChange: (id: number, status: ApprovalStatus) => void;
  onRegistrationStatusChange: (id: number, status: ApprovalStatus) => void;
  onSignOut: () => void;
};

export default function AdminDashboard({
  bookings,
  courts,
  courtRequests,
  courtStorageError,
  courtRequestStorageError,
  events,
  registrations,
  registrationStatuses,
  onAddCourt,
  onDeleteCourt,
  onCourtRequestStatusChange,
  onRefreshData,
  onImportLegacy,
  importStatus,
  onBookingStatusChange,
  onRegistrationStatusChange,
  onSignOut,
}: AdminDashboardProps) {
  const [courtName, setCourtName] = useState('');
  const [courtType, setCourtType] = useState('Basketball');
  const [courtLocation, setCourtLocation] = useState('');
  const [courtPrice, setCourtPrice] = useState('');
  const [courtDescription, setCourtDescription] = useState('');
  const [courtImage, setCourtImage] = useState<File | null>(null);
  const [courtFormError, setCourtFormError] = useState('');
  const [courtActionError, setCourtActionError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending');
  const completedBookings = bookings.filter((booking) => booking.status === 'Done');
  const pendingRegistrations = events.filter(
    (event) =>
      registrations[event.id] > 0 &&
      registrationStatuses[event.id] === 'Pending',
  );
  const pendingCourtRequests = courtRequests.filter(
    (request) => request.status === 'Pending',
  );

  async function changeCourtRequestStatus(id: number, status: CourtRequestStatus) {
    const changed = await onCourtRequestStatusChange(id, status);
    setCourtActionError(
      changed ? '' : 'The court request could not be updated. Check available storage and try again.',
    );
  }

  async function deleteCourt(court: Facility) {
    if (!window.confirm(`Delete "${court.name}" from the available courts?`)) {
      return;
    }

    const deleted = await onDeleteCourt(court.id);
    setCourtActionError(
      deleted ? '' : 'The court could not be deleted. Check available storage and try again.',
    );
  }

  async function refreshData() {
    setRefreshing(true);
    try {
      await onRefreshData();
    } catch (error) {
      setCourtActionError(
        error instanceof Error ? error.message : 'Unable to refresh data from Supabase.',
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function importLegacy() {
    setImporting(true);
    try {
      await onImportLegacy();
    } finally {
      setImporting(false);
    }
  }

  async function submitCourt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCourtFormError('');

    if (!courtImage || !courtImage.type.startsWith('image/')) {
      setCourtFormError('Choose an image file for the court.');
      return;
    }

    if (courtImage.size > 2 * 1024 * 1024) {
      setCourtFormError('The court image must be 2 MB or smaller.');
      return;
    }

    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('The selected image could not be read.'));
          }
        };
        reader.onerror = () => reject(new Error('The selected image could not be read.'));
        reader.readAsDataURL(courtImage);
      });

      const added = await onAddCourt({
        name: courtName.trim(),
        type: courtType,
        location: courtLocation.trim(),
        price: Number(courtPrice),
        image,
        description: courtDescription.trim(),
      });

      if (!added) {
        setCourtFormError('The court could not be saved on this device. Check available storage and try again.');
        return;
      }

      setCourtName('');
      setCourtType('Basketball');
      setCourtLocation('');
      setCourtPrice('');
      setCourtDescription('');
      setCourtImage(null);
      form.reset();
    } catch (error) {
      setCourtFormError(
        error instanceof Error ? error.message : 'The selected image could not be read.',
      );
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">COURTCONNECT ADMIN</span>
          <h1>Approval dashboard</h1>
          <p>Review client booking and event registration requests.</p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-refresh" onClick={importLegacy} disabled={importing}>
            {importing ? 'Importing…' : 'Import old browser data'}
          </button>
          <button type="button" className="admin-refresh" onClick={refreshData} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
          <button type="button" className="admin-signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-section" aria-labelledby="admin-courts-title">
        {importStatus && <p className="admin-empty" role="status">{importStatus}</p>}
        <div className="admin-section-heading">
          <h2 id="admin-courts-title">Manage courts</h2>
          <span>{courts.length} courts available</span>
        </div>
        {courtStorageError && <p className="admin-form-error" role="alert">{courtStorageError}</p>}
        {courtRequestStorageError && <p className="admin-form-error" role="alert">{courtRequestStorageError}</p>}
        {courtActionError && <p className="admin-form-error" role="alert">{courtActionError}</p>}
        <form className="admin-court-form" onSubmit={submitCourt}>
          <label>
            Court name
            <input value={courtName} onChange={(event) => setCourtName(event.target.value)} required />
          </label>
          <label>
            Sport
            <select value={courtType} onChange={(event) => setCourtType(event.target.value)}>
              <option>Basketball</option>
              <option>Volleyball</option>
              <option>Badminton</option>
              <option>Multi-sport</option>
              <option>Tennis</option>
            </select>
          </label>
          <label>
            Location
            <input value={courtLocation} onChange={(event) => setCourtLocation(event.target.value)} required />
          </label>
          <label>
            Price per hour (₱)
            <input
              type="number"
              min="0"
              step="1"
              value={courtPrice}
              onChange={(event) => setCourtPrice(event.target.value)}
              required
            />
          </label>
          <label className="admin-court-description">
            Description
            <textarea
              value={courtDescription}
              onChange={(event) => setCourtDescription(event.target.value)}
              rows={3}
              required
            />
          </label>
          <label className="admin-court-image">
            Court picture (max 2 MB)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCourtImage(event.target.files?.[0] ?? null)}
              required
            />
          </label>
          {courtFormError && <p className="admin-form-error" role="alert">{courtFormError}</p>}
          <button type="submit" className="admin-approve admin-add-court">
            Add court
          </button>
        </form>

        {courts.length > 0 && (
          <ul className="admin-court-list">
            {courts.map((court) => (
              <li key={court.id}>
                <img src={court.image} alt="" />
                <span><strong>{court.name}</strong>{court.location}</span>
                <strong>₱{court.price} / hour</strong>
                <button
                  type="button"
                  className="admin-delete-court"
                  onClick={() => deleteCourt(court)}
                  aria-label={`Delete ${court.name}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-section" aria-labelledby="admin-court-requests-title">
        <div className="admin-section-heading">
          <h2 id="admin-court-requests-title">Court addition requests</h2>
          <span>{pendingCourtRequests.length} pending</span>
        </div>
        {pendingCourtRequests.length === 0 ? (
          <p className="admin-empty">No court requests need approval.</p>
        ) : (
          <ul className="admin-list">
            {pendingCourtRequests.map((request) => (
              <li className="admin-request" key={request.id}>
                <div className="admin-request-info">
                  <strong>{request.name}</strong>
                  <span>{request.requesterName} · {request.requesterEmail}</span>
                  <span>{request.type} · {request.location}</span>
                  <span>₱{request.price} / hour</span>
                  <span>{request.description}</span>
                  <img className="admin-request-image" src={request.image} alt={`${request.name} court`} />
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-approve"
                    onClick={() => changeCourtRequestStatus(request.id, 'Confirmed')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-reject"
                    onClick={() => changeCourtRequestStatus(request.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-section" aria-labelledby="admin-bookings-title">
        <div className="admin-section-heading">
          <h2 id="admin-bookings-title">Booking requests</h2>
          <span>{pendingBookings.length} pending</span>
        </div>
        {pendingBookings.length === 0 ? (
          <p className="admin-empty">No booking requests need approval.</p>
        ) : (
          <ul className="admin-list">
            {pendingBookings.map((booking) => {
              const conflict = findConfirmedBookingConflict(booking, bookings);

              return (
                <li className="admin-request" key={booking.id}>
                  <div className="admin-request-info">
                    <strong>{booking.facility.name}</strong>
                    <span>{booking.customer} · {booking.facility.location}</span>
                    <span>{booking.date} · {booking.startTime}–{booking.endTime}</span>
                    <span>₱{booking.facility.price} / hour</span>
                    {conflict ? (
                      <span className="admin-conflict" role="status">
                        Unavailable: overlaps {conflict.customer}&apos;s approved booking
                        ({conflict.startTime}–{conflict.endTime}).
                      </span>
                    ) : (
                      <span className="admin-availability" role="status">
                        No approved booking overlaps this time.
                      </span>
                    )}
                  </div>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-approve"
                      disabled={Boolean(conflict)}
                      onClick={() => onBookingStatusChange(booking.id, 'Confirmed')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="admin-reject"
                      onClick={() => onBookingStatusChange(booking.id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-section" aria-labelledby="admin-completed-title">
        <div className="admin-section-heading">
          <h2 id="admin-completed-title">Completed bookings</h2>
          <span>{completedBookings.length} done</span>
        </div>
        {completedBookings.length === 0 ? (
          <p className="admin-empty">Completed bookings will appear here after their scheduled end time.</p>
        ) : (
          <ul className="admin-list">
            {completedBookings.map((booking) => (
              <li className="admin-request" key={booking.id}>
                <div className="admin-request-info">
                  <strong>{booking.facility.name}</strong>
                  <span>{booking.customer} · {booking.facility.location}</span>
                  <span>{booking.date} · {booking.startTime}–{booking.endTime}</span>
                </div>
                <span className="admin-done-badge">Done</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-section" aria-labelledby="admin-events-title">
        <div className="admin-section-heading">
          <h2 id="admin-events-title">Event registration requests</h2>
          <span>{pendingRegistrations.length} pending</span>
        </div>
        {pendingRegistrations.length === 0 ? (
          <p className="admin-empty">No event registration requests need approval.</p>
        ) : (
          <ul className="admin-list">
            {pendingRegistrations.map((event) => (
              <li className="admin-request" key={event.id}>
                <div className="admin-request-info">
                  <strong>{event.name}</strong>
                  <span>{registrations[event.id]} spot(s) · {event.category}</span>
                  <span>{event.date} · {event.time}</span>
                  <span>{event.venue}, {event.city}</span>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-approve"
                    onClick={() => onRegistrationStatusChange(event.id, 'Confirmed')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-reject"
                    onClick={() => onRegistrationStatusChange(event.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
