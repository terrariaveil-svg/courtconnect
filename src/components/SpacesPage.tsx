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
  customFacilities: Facility[];
  courtRequests: CourtRequest[];
  courtRequestStorageError: string;
  initialFacilityId?: number | null;
  searchValue?: string;
  onFacilityViewed: (facility: Facility) => void;
  onRequestCourt: (facility: Omit<Facility, 'id'>) => boolean | Promise<boolean>;
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
  customFacilities,
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
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('Basketball');
  const [facilityLocation, setFacilityLocation] = useState('');
  const [facilityPrice, setFacilityPrice] = useState('');
  const [facilityDescription, setFacilityDescription] = useState('');
  const [facilityImage, setFacilityImage] = useState<File | null>(null);
  const [facilityFormError, setFacilityFormError] = useState('');
  const [facilityFormMessage, setFacilityFormMessage] = useState('');
  const facilities = [
    ...spacesFor(choice),
    ...customFacilities.filter((facility) =>
      choice === 'gym' ? facility.type === 'Gym floor' : facility.type !== 'Gym floor',
    ),
  ];
  const matchingFacilities = searchValue.trim()
    ? searchFacilities([...COURTS, ...GYMS, ...customFacilities], searchValue)
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

  async function submitFacilityRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFacilityFormError('');
    setFacilityFormMessage('');

    if (!facilityImage || !facilityImage.type.startsWith('image/')) {
      setFacilityFormError(`Choose an image file for the ${choice === 'gym' ? 'gym' : 'court'}.`);
      return;
    }

    if (facilityImage.size > 2 * 1024 * 1024) {
      setFacilityFormError('The facility image must be 2 MB or smaller.');
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
        reader.readAsDataURL(facilityImage);
      });

      const saved = await onRequestCourt({
        name: facilityName.trim(),
        type: choice === 'gym' ? 'Gym floor' : facilityType,
        location: facilityLocation.trim(),
        price: Number(facilityPrice),
        image,
        description: facilityDescription.trim(),
      });

      if (!saved) {
        setFacilityFormError('Your request could not be saved. Check available storage and try again.');
        return;
      }

      setFacilityName('');
      setFacilityType('Basketball');
      setFacilityLocation('');
      setFacilityPrice('');
      setFacilityDescription('');
      setFacilityImage(null);
      form.reset();
      setFacilityFormMessage(`Your ${choice} request was sent to the admin for approval.`);
    } catch (error) {
      setFacilityFormError(
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
      {(choice === 'court' || choice === 'gym') && (
        <section className="court-request-panel" aria-labelledby="court-request-title">
          <div className="court-request-heading">
            <div>
              <span className="court-request-eyebrow">{choice === 'gym' ? 'GYM OWNERS' : 'COURT OWNERS'}</span>
              <h2 id="court-request-title">Request to add a {choice}</h2>
              <p>Submit your {choice} details. It will be listed after an admin approves it.</p>
            </div>
          </div>
          {courtRequestStorageError && (
            <p className="court-request-error" role="alert">{courtRequestStorageError}</p>
          )}
          <form className="court-request-form" onSubmit={submitFacilityRequest}>
            <label>
              {choice === 'gym' ? 'Gym name' : 'Court name'}
              <input value={facilityName} onChange={(event) => setFacilityName(event.target.value)} required />
            </label>
            {choice === 'court' ? (
              <label>
                Sport
                <select value={facilityType} onChange={(event) => setFacilityType(event.target.value)}>
                  <option>Basketball</option>
                  <option>Volleyball</option>
                  <option>Badminton</option>
                  <option>Multi-sport</option>
                  <option>Tennis</option>
                </select>
              </label>
            ) : (
              <label>
                Facility type
                <input value="Gym floor" readOnly />
              </label>
            )}
            <label>
              Location
              <input value={facilityLocation} onChange={(event) => setFacilityLocation(event.target.value)} required />
            </label>
            <label>
              Price per hour (₱)
              <input
                type="number"
                min="0"
                step="1"
                value={facilityPrice}
                onChange={(event) => setFacilityPrice(event.target.value)}
                required
              />
            </label>
            <label className="court-request-wide">
              Description
              <textarea
                value={facilityDescription}
                onChange={(event) => setFacilityDescription(event.target.value)}
                rows={3}
                required
              />
            </label>
            <label className="court-request-wide">
              {choice === 'gym' ? 'Gym picture' : 'Court picture'} (max 2 MB)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFacilityImage(event.target.files?.[0] ?? null)}
                required
              />
            </label>
            {facilityFormError && <p className="court-request-error court-request-wide" role="alert">{facilityFormError}</p>}
            {facilityFormMessage && <p className="court-request-success court-request-wide" role="status">{facilityFormMessage}</p>}
            <button type="submit" className="court-request-submit">Send for approval</button>
          </form>

          <div className="court-request-history">
            <h3>Your facility requests</h3>
            {courtRequests.length === 0 ? (
              <p>No facility requests yet.</p>
            ) : (
              <ul>
                {courtRequests.map((request) => (
                  <li key={request.id}>
                    <span><strong>{request.name}</strong>{request.type} · {request.location}</span>
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