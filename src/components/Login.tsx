import { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';
import logo from '../assets/courtconnect-logo.png';

type LoginProps = {
  onLogin: (email: string, password: string) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-brand">
          <img src={logo} alt="CourtConnect logo" className="login-logo" />
          <span>PLAYR</span>
        </div>

        <p className="login-eyebrow">MEMBER ACCESS</p>
        <h1 className="login-title">Welcome back.</h1>
        <p className="login-subtitle">
          Sign in to manage your bookings and check club availability.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

          <a href="#" className="login-forgot">
            Forgot password?
          </a>
        </form>
      </section>
    </main>
  );
}