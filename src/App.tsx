
import { useState, type FormEvent } from "react";
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoggedIn(true);
  }

  const filteredFacilities = facilities.filter((facility) =>
    `${facility.name} ${facility.type} ${facility.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!loggedIn) {
    return (
      <div className="playr-login-page">
        <style>{`
          .playr-login-page {
            min-height: 100vh;
            width: 100%;
            box-sizing: border-box;
            background: #cecece;
            color: #111;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .playr-login-container {
            width: 100%;
            max-width: 390px;
          }

          .playr-login-logo {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .playr-login-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #071b0b;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .playr-login-label {
            color: #b85a00;
            font-size: 12px;
            margin: 0 0 8px 26px;
          }

          .playr-login-container h1 {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 6px 23px;
            color: #111;
          }

          .playr-login-description {
            font-size: 12px;
            line-height: 1.5;
            margin: 0 0 14px 20px;
            color: #111;
          }

          .playr-login-form {
            min-height: 193px;
            border: 1px solid #d8d8d8;
            border-radius: 4px;
            padding: 10px 9px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .playr-login-form label {
            font-size: 10px;
            margin-bottom: 4px;
            color: #111;
          }

          .playr-login-form input {
            width: 100%;
            height: 19px;
            box-sizing: border-box;
            border: 1px solid #e3e3e3;
            border-radius: 4px;
            background: #fff;
            padding: 2px 6px;
            font-size: 10px;
            margin-bottom: 10px;
            color: #111;
          }

          .playr-login-form input::placeholder {
            color: #b5b5b5;
          }

          .playr-login-submit {
            height: 20px;
            background: #292929;
            color: #fff;
            border: 1px solid #111;
            border-radius: 3px;
            font-size: 10px;
            cursor: pointer;
            margin-bottom: 10px;
          }

          .playr-login-forgot {
            align-self: flex-start;
            padding: 0;
            background: transparent;
            border: none;
            color: #111;
            text-decoration: underline;
            font-size: 10px;
            cursor: pointer;
          }

          @media (max-width: 480px) {
            .playr-login-page {
              padding: 20px;
            }
          }
        `}</style>

        <div className="playr-login-container">
          <div className="playr-login-logo">
            <span className="playr-login-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8ff65"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
                <path d="M3.5 11.5H12V19.5" />
                <path d="M12 4.5V11.5H20.5" />
              </svg>
            </span>
            <span>PLAYR</span>
          </div>

          <div className="playr-login-label">MEMBER ACCESS</div>

          <h1>Welcome back.</h1>

          <p className="playr-login-description">
            Sign in to manage your bookings and check club availability.
          </p>

          <form className="playr-login-form" onSubmit={handleLogin}>
            <label htmlFor="playr-email">Email</label>
            <input
              id="playr-email"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="playr-password">Password</label>
            <input
              id="playr-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="playr-login-submit" type="submit">
              Sign In
            </button>

            <button
              className="playr-login-forgot"
              type="button"
              onClick={() =>
                alert("Please contact the administrator to reset your password.")
              }
            >
              Forgot password?
            </button>
          </form>
        </div>
      </div>
    );
  }

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
