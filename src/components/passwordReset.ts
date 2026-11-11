export const RESET_MINUTES = 10; // how long a code works
export const MAX_ATTEMPTS = 5; // wrong codes allowed before a new one is needed
export const MIN_PASSWORD = 8; // match your Create account rule if it is different

// A reset that is waiting for its code (kept in memory only, never saved)
export type PendingReset = {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

export type RequestResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export type ResetResult =
  | { ok: true }
  | { ok: false; error: string; restart?: boolean };

// A random 6-digit code, e.g. "048213"
export function makeResetCode(): string {
  const n = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return String(n % 1_000_000).padStart(6, '0');
}