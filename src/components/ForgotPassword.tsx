import { useState } from 'react';
import type { FormEvent } from 'react';
import './ForgotPassword.css';
import logo from '../assets/courtconnect-logo.png';
import { MAX_ATTEMPTS, MIN_PASSWORD, RESET_MINUTES } from './passwordReset';
import type { RequestResult, ResetResult } from './passwordReset';

type Step = 'email' | 'code' | 'done';

type ForgotPasswordProps = {
  onRequestCode: (email: string) => RequestResult;
  onReset: (code: string, newPassword: string) => Promise<ResetResult>;
  onBack: () => void;
};

export default function ForgotPassword({ onRequestCode, onReset, onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const requestCode = (resend: boolean) => {
    const result = onRequestCode(email);
    if (!result.ok) {
      setError(result.error);
      setStep('email');
      return;
    }
    setDemoCode(result.code);
    setCode('');
    setError('');
    setInfo(resend ? 'A new code was made. The old one no longer works.' : '');
    setStep('code');
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    requestCode(false);
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code.');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Your new password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setBusy(true);
    const result = await onReset(code.trim(), password);
    setBusy(false);

    if (result.ok) {
      setError('');
      setInfo('');
      setPassword('');
      setConfirm('');
      setStep('done');
      return;
    }

    setError(result.error);
    if (result.restart) setStep('email');
  };

  return (
    <main className="fp-page">
      <section className="fp-container">
        <div className="fp-brand">
          <img src={logo} alt="" className="fp-logo" />
          <span>PLAYR</span>
        </div>

        <p className="fp-eyebrow">ACCOUNT RECOVERY</p>
        <h1 className="fp-title">
          {step === 'done' ? 'Password updated.' : 'Reset your password.'}
        </h1>
        <p className="fp-subtitle">
          {step === 'email' && 'Enter the email you signed up with and we will make you a reset code.'}
          {step === 'code' && 'Enter the code and choose a new password.'}
          {step === 'done' && 'You can now sign in with your new password.'}
        </p>

        <div className="fp-card">
          {error && (
            <p className="fp-error" role="alert">
              {error}
            </p>
          )}

          {step === 'email' && (
            <form onSubmit={submitEmail} noValidate>
              <label className="fp-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  placeholder="alex@example.com"
                  autoComplete="email"
                  autoFocus
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                />
              </label>

              <button type="submit" className="fp-primary">
                Send reset code
              </button>
              <button type="button" className="fp-link" onClick={onBack}>
                Back to sign in
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={submitReset} noValidate>
              <div className="fp-demo" role="status">
                <strong>Demo mode</strong>
                <span>
                  This app has no email server yet, so your code is shown here instead of being
                  emailed to {email.trim().toLowerCase()}.
                </span>
                <b className="fp-code" aria-label={`Reset code ${demoCode.split('').join(' ')}`}>
                  {demoCode}
                </b>
                <span>
                  Works for {RESET_MINUTES} minutes, with {MAX_ATTEMPTS} tries.
                </span>
              </div>

              {info && <p className="fp-info">{info}</p>}

              <label className="fp-field">
                <span>Reset code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  maxLength={6}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  autoFocus
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                />
              </label>

              <label className="fp-field">
                <span>New password</span>
                <div className="fp-pass">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    placeholder={`At least ${MIN_PASSWORD} characters`}
                    autoComplete="new-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                  />
                  <button
                    type="button"
                    className="fp-toggle"
                    aria-pressed={show}
                    onClick={() => setShow((s) => !s)}
                  >
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <label className="fp-field">
                <span>Confirm new password</span>
                <input
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  placeholder="Type it again"
                  autoComplete="new-password"
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError('');
                  }}
                />
              </label>

              <button type="submit" className="fp-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Reset password'}
              </button>

              <div className="fp-row">
                <button type="button" className="fp-link" onClick={() => requestCode(true)}>
                  Resend code
                </button>
                <button
                  type="button"
                  className="fp-link"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setInfo('');
                  }}
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          {step === 'done' && (
            <div className="fp-done" role="status">
              <span className="fp-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <p>Your password was changed. The old one no longer works.</p>
              <button type="button" className="fp-primary" onClick={onBack}>
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}