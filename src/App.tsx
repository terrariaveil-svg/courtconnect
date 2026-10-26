
import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Featured from "./components/Featured";
import AvailableSpaces, { type Facility } from "./components/AvailableSpaces";
import Events, { type SportEvent } from "./components/Events";
import BookingForm, { type Booking } from "./components/BookingForm";
import BookingConfirmed from "./components/BookingConfirmed";
import MyBookings from "./components/MyBookings";
import Notifications from "./components/Notifications";
import Footer from "./components/Footer";
import "./App.css";

const facilities: Facility[] = [
  {
    id: 1,
    name: "Champions Basketball Court",
    type: "Basketball",
    location: "Kidapawan City",
    price: 500,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
    description: "An indoor court for friendly games and tournaments.",
  },
  {
    id: 2,
    name: "Elite Volleyball Arena",
    type: "Volleyball",
    location: "Kidapawan City",
    price: 400,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80",
    description: "A spacious court for team practice and matches.",
  },
  {
    id: 3,
    name: "Premier Badminton Court",
    type: "Badminton",
    location: "Kidapawan City",
    price: 250,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
    description: "A court for casual rallies and competitive play.",
  },
  {
    id: 4,
    name: "Community Sports Complex",
    type: "Multi-sport",
    location: "Kidapawan City",
    price: 600,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    description: "A versatile sports space for your next activity.",
  },
];

const events: SportEvent[] = [
  {
    id: 1,
    name: "Community Basketball Tournament",
    category: "Basketball",
    date: "November 15, 2026",
    price: 100,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Volleyball Friendly Match",
    category: "Volleyball",
    date: "November 21, 2026",
    price: 0,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Badminton Open Play",
    category: "Badminton",
    date: "November 28, 2026",
    price: 50,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  },
];

export default function App() {
  const [page, setPage] = useState("Home");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");

  function openBooking(facility: Facility) {
    setSelectedFacility(facility);
  }

  function confirmBooking(booking: Booking) {
    setBookings((previous) => [booking, ...previous]);
    setLastBooking(booking);
    setSelectedFacility(null);
    setPage("Confirmation");
  }

  function cancelBooking(id: number) {
    setBookings((previous) => previous.filter((booking) => booking.id !== id));
  }

  const filteredFacilities = facilities.filter((facility) =>
    `${facility.name} ${facility.type} ${facility.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <Navbar
        page={page}
        setPage={setPage}
        bookingCount={bookings.length}
      />

      <main className="main-content">
        {page === "Home" && (
          <>
            <Hero
              onExplore={() => setPage("Facilities")}
              onEvents={() => setPage("Events")}
            />
            <Featured
              facilities={facilities}
              onBook={openBooking}
              onViewAll={() => setPage("Facilities")}
            />
            <section className="home-cta">
              <h2>Ready for your next game?</h2>
              <p>Find a facility, choose your schedule, and reserve your space.</p>
              <button
                className="button button-primary"
                onClick={() => setPage("Facilities")}
              >
                Find a Court
              </button>
            </section>
          </>
        )}

        {page === "Facilities" && (
          <section className="page-section">
            <span className="eyebrow">EXPLORE OUR SPACES</span>
            <h2>Available Facilities</h2>
            <p className="section-intro">
              Find the right space for your next match or training session.
            </p>
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search facilities, sports, or location..."
            />
            {filteredFacilities.length === 0 ? (
              <div className="empty-state">
                <h3>No facilities found</h3>
                <p>Try searching for another sport or facility.</p>
              </div>
            ) : (
              <div className="facility-grid">
                {filteredFacilities.map((facility) => (
                  <AvailableSpaces
                    key={facility.id}
                    facility={facility}
                    onBook={openBooking}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {page === "Events" && <Events events={events} />}

        {page === "My Bookings" && (
          <MyBookings bookings={bookings} onCancel={cancelBooking} />
        )}

        {page === "Notifications" && <Notifications bookings={bookings} />}

        {page === "Confirmation" && lastBooking && (
          <BookingConfirmed
            booking={lastBooking}
            onDone={() => setPage("My Bookings")}
          />
        )}
      </main>

      <Footer />

      {selectedFacility && (
        <BookingForm
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          onConfirm={confirmBooking}
        />
      )}
    </div>
  );
}
