import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import './UserInfo.css';
import profileImg from '../assets/profile.jpeg';
import RecentVisited from './RecentVisited';
import type { Visit } from './recentVisits';
import type { Booking } from './BookingForm';
import type { Facility } from './AvailableSpaces';
import type { ApprovalStatus } from './approval';
import { formatTotalTime, getFitnessOverview } from './fitnessOverview';

type UserInfoProps = {
  userName?: string;
  avatarUrl?: string;
  registeredAt?: string;
  address?: string;
  visits?: Visit[];
  bookings: Booking[];
  courts?: Facility[];
  onHome: () => void;
  onSaveAddress?: (address: string) => Promise<void>;
  onSaveAvatar?: (file: File) => Promise<void>;
  onUpdateCourt?: (court: Facility) => Promise<void>;
  onDeleteCourt?: (id: number) => Promise<boolean>;
  onBookingStatusChange?: (id: number, status: ApprovalStatus) => void;
  onClearVisits?: () => void;
  onOpenVisit?: (visit: Visit) => void;
  onExplore?: () => void;
};

function formatRegistrationDate(value?: string): string {
  if (!value) return 'Unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date).toUpperCase();
}

function getProfileSaveError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Unable to save your address.';
}

export default function UserInfo({
  userName = 'Alex Wassabi',
  avatarUrl,
  registeredAt,
  address = '',
  visits = [],
  bookings,
  courts = [],
  onHome,
  onSaveAddress,
  onSaveAvatar,
  onUpdateCourt,
  onDeleteCourt,
  onBookingStatusChange,
  onClearVisits,
  onOpenVisit,
  onExplore,
}: UserInfoProps) {
  const fitness = getFitnessOverview(bookings);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(address);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null);
  const [courtDraft, setCourtDraft] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    description: '',
  });
  const [courtError, setCourtError] = useState('');
  const [savingCourt, setSavingCourt] = useState(false);

  function beginCourtEdit(court: Facility) {
    setEditingCourtId(court.id);
    setCourtDraft({
      name: court.name,
      type: court.type,
      location: court.location,
      price: String(court.price),
      description: court.description,
    });
    setCourtError('');
  }

  async function saveCourt(event: FormEvent<HTMLFormElement>, court: Facility) {
    event.preventDefault();
    if (!onUpdateCourt) return;

    setSavingCourt(true);
    setCourtError('');
    try {
      await onUpdateCourt({
        ...court,
        ...courtDraft,
        price: Number(courtDraft.price),
      });
      setEditingCourtId(null);
    } catch (error) {
      setCourtError(
        error instanceof Error ? error.message : 'Unable to update this court.',
      );
    } finally {
      setSavingCourt(false);
    }
  }

  async function deleteOwnedCourt(court: Facility) {
    if (!onDeleteCourt || !window.confirm(`Delete "${court.name}"?`)) return;
    setCourtError('');
    try {
      const deleted = await onDeleteCourt(court.id);
      if (!deleted) throw new Error('Unable to delete this court.');
    } catch (error) {
      setCourtError(
        error instanceof Error ? error.message : 'Unable to delete this court.',
      );
    }
  }

  async function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSaveAddress) return;

    setIsSavingAddress(true);
    setAddressError('');
    try {
      await onSaveAddress(addressDraft.trim());
      setIsEditingAddress(false);
    } catch (error) {
      setAddressError(getProfileSaveError(error));
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function handleAvatarChange(file?: File) {
    if (!file || !onSaveAvatar) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Your profile photo must be 5 MB or smaller.');
      return;
    }

    setIsSavingAvatar(true);
    setAvatarError('');
    try {
      await onSaveAvatar(file);
    } catch (error) {
      setAvatarError(
        error instanceof Error ? error.message : 'Unable to update your profile photo.',
      );
    } finally {
      setIsSavingAvatar(false);
    }
  }

  return (
    <div className="user-page">
      <div className="user-card">
        {/* Header */}
        <header className="user-header">
          <div className="user-header-left">
            <div className="user-photo-control">
              <div className="user-photo">
                <img src={avatarUrl || profileImg} alt={`${userName}'s profile`} className="user-photo-img" />
              </div>
              {onSaveAvatar && (
                <>
                  <input
                    ref={avatarInputRef}
                    className="user-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Choose a profile photo"
                    disabled={isSavingAvatar}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      void handleAvatarChange(file);
                    }}
                  />
                  <button
                    type="button"
                    className="user-photo-edit"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isSavingAvatar}
                  >
                    {isSavingAvatar ? 'Uploading…' : 'Change photo'}
                  </button>
                  {avatarError && <p className="user-photo-error" role="alert">{avatarError}</p>}
                </>
              )}
            </div>
            <div>
              <h1 className="user-name">{userName}</h1>
              <p className="user-registered">DATE REGISTERED: {formatRegistrationDate(registeredAt)}</p>
              {isEditingAddress && onSaveAddress ? (
                <form className="user-address-form" onSubmit={handleAddressSubmit}>
                  <label className="user-address-label" htmlFor="profile-address">
                    Address
                  </label>
                  <input
                    id="profile-address"
                    className="user-address-input"
                    type="text"
                    autoComplete="street-address"
                    maxLength={250}
                    value={addressDraft}
                    onChange={(event) => setAddressDraft(event.target.value)}
                    disabled={isSavingAddress}
                    autoFocus
                  />
                  <div className="user-address-actions">
                    <button type="submit" disabled={isSavingAddress}>
                      {isSavingAddress ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      disabled={isSavingAddress}
                      onClick={() => {
                        setAddressDraft(address);
                        setAddressError('');
                        setIsEditingAddress(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {addressError && <p className="user-address-error" role="alert">{addressError}</p>}
                </form>
              ) : (
                <div className="user-address-row">
                  <p className="user-location">{address || 'No address added'}</p>
                  {onSaveAddress && (
                    <button
                      type="button"
                      className="user-address-edit"
                      onClick={() => {
                        setAddressDraft(address);
                        setAddressError('');
                        setIsEditingAddress(true);
                      }}
                    >
                      Edit address
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button type="button" className="user-home-btn" onClick={onHome}>
            HOME
          </button>
        </header>

        {/* Fitness overview */}
        <section className="user-section">
          <h2 className="user-section-title">Your Fitness Overview</h2>
          <div className="user-stats">
            <div className="user-stat">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
              </svg>
              <strong>{fitness.workouts}</strong>
              <span>Workouts</span>
            </div>

            <div className="user-stat">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" />
              </svg>
              <strong>{fitness.streak}</strong>
              <span>Day streak</span>
            </div>

            <div className="user-stat">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <strong>{formatTotalTime(fitness.totalMinutes)}</strong>
              <span>Total time</span>
            </div>
          </div>
        </section>

        {courts.length > 0 && (
          <section className="user-section" aria-labelledby="user-courts-title">
            <h2 className="user-section-title" id="user-courts-title">Your approved courts</h2>
            <p className="user-courts-help">You can edit or remove only courts approved from your requests.</p>
            {courtError && <p className="user-courts-error" role="alert">{courtError}</p>}
            <ul className="user-court-list">
              {courts.map((court) => {
                const courtBookings = bookings.filter(
                  (booking) => booking.facility.id === court.id,
                );

                return (
                  <li key={court.id} className="user-court-item">
                    <img src={court.image} alt="" />
                    {editingCourtId === court.id ? (
                    <form className="user-court-form" onSubmit={(event) => void saveCourt(event, court)}>
                      <label>
                        Court name
                        <input
                          required
                          maxLength={120}
                          value={courtDraft.name}
                          onChange={(event) => setCourtDraft({ ...courtDraft, name: event.target.value })}
                        />
                      </label>
                      <label>
                        Sport
                        <input
                          required
                          maxLength={60}
                          value={courtDraft.type}
                          onChange={(event) => setCourtDraft({ ...courtDraft, type: event.target.value })}
                        />
                      </label>
                      <label>
                        Location
                        <input
                          required
                          maxLength={200}
                          value={courtDraft.location}
                          onChange={(event) => setCourtDraft({ ...courtDraft, location: event.target.value })}
                        />
                      </label>
                      <label>
                        Price per hour
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          value={courtDraft.price}
                          onChange={(event) => setCourtDraft({ ...courtDraft, price: event.target.value })}
                        />
                      </label>
                      <label className="user-court-description">
                        Description
                        <textarea
                          required
                          maxLength={1000}
                          rows={3}
                          value={courtDraft.description}
                          onChange={(event) => setCourtDraft({ ...courtDraft, description: event.target.value })}
                        />
                      </label>
                      <div className="user-court-actions">
                        <button type="submit" disabled={savingCourt}>
                          {savingCourt ? 'Saving…' : 'Save changes'}
                        </button>
                        <button type="button" disabled={savingCourt} onClick={() => setEditingCourtId(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                    ) : (
                      <>
                        <div className="user-court-content">
                          <span className="user-court-details">
                            <strong>{court.name}</strong>
                            <span>{court.type} · {court.location}</span>
                            <span>₱{court.price} / hour</span>
                          </span>
                          <div className="user-court-actions">
                            {onUpdateCourt && (
                              <button type="button" onClick={() => beginCourtEdit(court)}>Edit</button>
                            )}
                            {onDeleteCourt && (
                              <button type="button" onClick={() => void deleteOwnedCourt(court)}>Delete</button>
                            )}
                          </div>
                        </div>
                        <div className="user-court-bookings">
                          <strong>Bookings ({courtBookings.length})</strong>
                          {courtBookings.length === 0 ? (
                            <span>No bookings yet.</span>
                          ) : (
                            <ul>
                              {courtBookings.map((booking) => (
                                <li key={booking.id}>
                                  <span>{booking.customer}</span>
                                  <span>{booking.date} · {booking.startTime}–{booking.endTime}</span>
                                  <span className={`user-court-booking-status user-court-booking-status-${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                  </span>
                                  {booking.status === 'Pending' && onBookingStatusChange && (
                                    <span className="user-court-booking-actions">
                                      <button
                                        type="button"
                                        onClick={() => onBookingStatusChange(booking.id, 'Confirmed')}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onBookingStatusChange(booking.id, 'Rejected')}
                                      >
                                        Reject
                                      </button>
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Recent visited */}
        <RecentVisited
          visits={visits}
          onClear={onClearVisits}
          onExplore={onExplore}
          onOpen={onOpenVisit ? (id) => {
            const visit = visits.find((v) => v.id === id);
            if (visit) onOpenVisit(visit);
          } : undefined}
        />
      </div>
    </div>
  );
}