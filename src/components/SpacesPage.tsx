import { useState, type FormEvent } from 'react';
import VenueDetail from './VenueDetail';
import type { Booking } from './BookingForm';
import type { Facility } from './AvailableSpaces';
import type { SpaceChoice } from './QuickBook';
import { COURTS, GYMS, searchFacilities, spacesFor } from './spacesData';
import type { CourtRequest, CourtRequestStatus } from './courtRequests';
import './SpacesPage.css';

type SpacesPageProps = {
  choice: SpaceChoice;
  customCourts: Facility[];
  courtRequests: CourtRequest[];
  courtRequestStorageError: string;
  initialFacilityId?: number | null;
  searchValue?: string;
  onFacilityViewed: (facility: Facility) => void;
  onRequestCourt: (court: Omit<Facility, 'id'>) => boolean | Promise<boolean>;
  onChoiceChange: (choice: SpaceChoice) => void;
  onBooked: (booking: Booking) => void;
  userName?: string;
  unreadCount: number;
  bookingCount: number;
  onHome: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  onOpenSpaces: () => void;
  onOpenEvents: () => void;
  onOpenNotifications: () => void;
  onSearch: (query: string) => void;
};

export default function SpacesPage({
  choice,
  customCourts,
  courtRequests,
  courtRequestStorageError,
  initialFacilityId,
  searchValue = '',
  onFacilityViewed,
  onRequestCourt,
  onBooked,
  userName,
  unreadCount,
  bookingCount,
  onHome,
  onOpenProfile,
  onOpenBookings,
  onOpenSpaces,
  onOpenEvents,
  onOpenNotifications,
  onSearch,
}: SpacesPageProps) {
  const [courtName, setCourtName] = useState('');
  const [courtType, setCourtType] = useState('Basketball');
  const [courtLocation, setCourtLocation] = useState('');
  const [courtPrice, setCourtPrice] = useState('');
  const [courtDescription, setCourtDescription] = useState('');
  const [courtImage, setCourtImage] = useState<File | null>(null);
  const [courtFormError, setCourtFormError] = useState('');
  const [courtFormMessage, setCourtFormMessage] = useState('');
  const facilities = [
    ...spacesFor(choice),
    ...(choice === 'court' ? customCourts : []),
  ];
  const matchingFacilities = searchValue.trim()
    ? searchFacilities([...COURTS, ...GYMS, ...customCourts], searchValue)
    : facilities;

  const [selection, setSelection] = useState({
    searchValue,
    initialFacilityId,
    facilityId: initialFacilityId ?? null,
  });
  const selectedFacilityId =
    selection.searchValue === searchValue &&
    selection.initialFacilityId === initialFacilityId
      ? selection.facilityId
      : initialFacilityId ?? null;
  const selectFacility = (facilityId: number) => {
    setSelection({ searchValue, initialFacilityId, facilityId });
  };

  const facility =
    matchingFacilities.find((item) => item.id === selectedFacilityId) ??
    matchingFacilities[0];

  async function submitCourtRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCourtFormError('');
    setCourtFormMessage('');

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

      const saved = await onRequestCourt({
        name: courtName.trim(),
        type: courtType,
        location: courtLocation.trim(),
        price: Number(courtPrice),
        image,
        description: courtDescription.trim(),
      });

      if (!saved) {
        setCourtFormError('Your request could not be saved on this device. Check available storage and try again.');
        return;
      }

      setCourtName('');
      setCourtType('Basketball');
      setCourtLocation('');
      setCourtPrice('');
      setCourtDescription('');
      setCourtImage(null);
      form.reset();
      setCourtFormMessage('Your court request was sent to the admin for approval.');
    } catch (error) {
      setCourtFormError(
        error instanceof Error ? error.message : 'The selected image could not be read.',
      );
    }
  }

  const requestStatusLabel = (status: CourtRequestStatus) => (
    status === 'Confirmed' ? 'Approved' : status
  );

  return (
    <>
      {facility ? (
        <VenueDetail
          key={facility.id}
          facility={facility}
          facilities={matchingFacilities}
          onSelectFacility={selectFacility}
          onFacilityViewed={onFacilityViewed}
          userName={userName}
          unreadCount={unreadCount}
          bookingCount={bookingCount}
          onBack={onHome}
          onOpenProfile={onOpenProfile}
          onOpenBookings={onOpenBookings}
          onOpenSpaces={onOpenSpaces}
          onOpenEvents={onOpenEvents}
          onOpenNotifications={onOpenNotifications}
          searchValue={searchValue}
          onSearch={onSearch}
          onRent={onBooked}
        />
      ) : (
        <section className="spaces-no-results" role="status">
          <h1>{searchValue.trim() ? 'No spaces found' : 'No available facilities found'}</h1>
          {searchValue.trim() && <p>No venues, sports, or locations match “{searchValue.trim()}”.</p>}
        </section>
      )}
      {choice === 'court' && (
        <section className="court-request-panel" aria-labelledby="court-request-title">
          <div className="court-request-heading">
            <div>
              <span className="court-request-eyebrow">COURT OWNERS</span>
              <h2 id="court-request-title">Request to add a court</h2>
              <p>Submit your court details. It will be listed after an admin approves it.</p>
            </div>
          </div>
          {courtRequestStorageError && (
            <p className="court-request-error" role="alert">{courtRequestStorageError}</p>
          )}
          <form className="court-request-form" onSubmit={submitCourtRequest}>
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
            <label className="court-request-wide">
              Description
              <textarea
                value={courtDescription}
                onChange={(event) => setCourtDescription(event.target.value)}
                rows={3}
                required
              />
            </label>
            <label className="court-request-wide">
              Court picture (max 2 MB)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setCourtImage(event.target.files?.[0] ?? null)}
                required
              />
            </label>
            {courtFormError && <p className="court-request-error court-request-wide" role="alert">{courtFormError}</p>}
            {courtFormMessage && <p className="court-request-success court-request-wide" role="status">{courtFormMessage}</p>}
            <button type="submit" className="court-request-submit">Send for approval</button>
          </form>

          <div className="court-request-history">
            <h3>Your court requests</h3>
            {courtRequests.length === 0 ? (
              <p>No court requests yet.</p>
            ) : (
              <ul>
                {courtRequests.map((request) => (
                  <li key={request.id}>
                    <span><strong>{request.name}</strong>{request.location}</span>
                    <span className={`court-request-status court-request-status-${request.status.toLowerCase()}`}>
                      {requestStatusLabel(request.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </>
  );
}