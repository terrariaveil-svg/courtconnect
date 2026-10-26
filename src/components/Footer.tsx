
import { Volleyball, MapPin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="brand">
          <span className="brand-icon"><Volleyball size={22} /></span>
          <span>Court<span className="green">Connect</span></span>
        </div>
        <p>Your game, your space, your community.</p>
      </div>

      <div className="footer-contact">
        <p><MapPin size={16} /> Kidapawan City, Philippines</p>
        <p><Mail size={16} /> courtconnect@example.com</p>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} CourtConnect. All rights reserved.
      </p>
    </footer>
  );
}
