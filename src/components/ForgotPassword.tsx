import { useState, type FormEvent } from 'react';
import './ForgotPassword.css';
import logo from '../assets/courtconnect-logo.png';

type ForgotPasswordProps = {
  recoveryMode: boolean;
  onRequestReset: (email: string) => Promise<void>;
  onResetPassword: (password: string) => Promise<void>;
  onBack: () => void;
};

export default function ForgotPassword({
  recoveryMode,
  onRequestReset,
  onResetPassword,
  onBack,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);

    try {
      await onRequestReset(email.trim());
      setInfo('If an account exists for that email, Supabase will send a password reset link.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to send the password reset email.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await onResetPassword(password);
      setInfo('Your password was updated. You can now sign in.');
      setPassword('');
      setConfirm('');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to update your password.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fp-page">
      <section className="fp-container">
        <div className="fp-brand">
          <img src={logo} alt="" className="fp-logo" />
          <span>PLAYR</span>
        </div>

        <p className="fp-eyebrow">ACCOUNT RECOVERY</p>
        <h1 className="fp-title">
          {recoveryMode ? 'Choose a new password.' : 'Reset your password.'}
        </h1>
        <p className="fp-subtitle">
          {recoveryMode
            ? 'Enter a new password for your CourtConnect account.'
            : 'We will email you a secure password reset link.'}
        </p>

        <div className="fp-card">
          {error && <p className="fp-error" role="alert">{error}</p>}
          {info && <p className="fp-info" role="status">{info}</p>}

          {recoveryMode ? (
            <form onSubmit={submitPassword} noValidate>
              <label className="fp-field">
                <span>New password</span>
                <input
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label className="fp-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirm}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </label>
              <button type="submit" className="fp-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Update password'}
              </button>
              <button type="button" className="fp-link" onClick={onBack}>
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={submitEmail} noValidate>
              <label className="fp-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  placeholder="alex@example.com"
                  autoComplete="email"
                  required
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button type="submit" className="fp-primary" disabled={busy}>
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
              <button type="button" className="fp-link" onClick={onBack}>
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
