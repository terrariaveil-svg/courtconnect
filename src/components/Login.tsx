import { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';
import logo from '../assets/courtconnect-logo.png';

type LoginProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onCreateAccount: (name: string, email: string, password: string) => Promise<void>;
  onForgotPassword?: () => void;
  error?: string;
};

export default function Login({
  onLogin,
  onCreateAccount,
  error,
  onForgotPassword,
}: LoginProps) {
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (creatingAccount) {
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        await onCreateAccount(name.trim(), email.trim(), password);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await onLogin(email, password);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-brand">
          <img src={logo} alt="CourtConnect logo" className="login-logo" />
          <span>PLAYR</span>
        </div>

        <p className="login-eyebrow">{creatingAccount ? 'NEW MEMBER' : 'MEMBER ACCESS'}</p>
        <h1 className="login-title">{creatingAccount ? 'Create your account.' : 'Welcome back.'}</h1>
        <p className="login-subtitle">
          {creatingAccount
            ? 'Join CourtConnect to book courts and register for events.'
            : 'Sign in to manage your bookings and check club availability.'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {creatingAccount && (
            <div className="login-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
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
              autoComplete={creatingAccount ? 'new-password' : 'current-password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={creatingAccount ? 8 : undefined}
              required
            />
          </div>

          {creatingAccount && (
            <div className="login-field">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          )}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : creatingAccount ? 'Create Account' : 'Sign In'}
          </button>

          {onForgotPassword && (
            <button type="button" className="forgot-link" onClick={onForgotPassword}>
              Forgot password?
            </button>
          )}

          {(formError || error) && <p className="login-error" role="alert">{formError || error}</p>}
          {!creatingAccount && (
            <p className="login-admin-hint">
              Administrator access is assigned to accounts in Supabase.
            </p>
          )}

          <button
            type="button"
            className="login-mode-toggle"
            onClick={() => {
              setCreatingAccount((current) => !current);
              setFormError('');
            }}
          >
            {creatingAccount ? 'Already have an account? Sign in' : 'New to CourtConnect? Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}