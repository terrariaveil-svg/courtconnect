
import { Volleyball, Bell, CalendarDays } from "lucide-react";

interface NavbarProps {
  page: string;
  setPage: (page: string) => void;
  bookingCount: number;
}

export default function Navbar({
  page,
  setPage,
  bookingCount,
}: NavbarProps) {
  const links = ["Home", "Facilities", "Events", "My Bookings"];

  return (
    <header className="navbar">
      <button className="brand" onClick={() => setPage("Home")}>
        <span className="brand-icon"><Volleyball size={23} /></span>
        <span>Court<span className="green">Connect</span></span>
      </button>

      <nav className="nav-links">
        {links.map((link) => (
          <button
            key={link}
            className={`nav-link ${page === link ? "active" : ""}`}
            onClick={() => setPage(link)}
          >
            {link}
          </button>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          className="icon-button"
          title="Notifications"
          onClick={() => setPage("Notifications")}
        >
          <Bell size={20} />
        </button>
        <button
          className="button button-primary button-small"
          onClick={() => setPage("My Bookings")}
        >
          <CalendarDays size={17} />
          My Bookings ({bookingCount})
        </button>
      </div>
    </header>
  );
}
