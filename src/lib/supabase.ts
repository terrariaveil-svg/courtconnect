import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const browserFetch = globalThis.fetch.bind(globalThis);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: async (input, init) => {
          const request = input instanceof Request ? input : new Request(input, init);
          const requestUrl = new URL(request.url);
          const supabaseOrigin = new URL(supabaseUrl).origin;
          const restPrefix = '/rest/v1/';

          if (
            requestUrl.origin !== supabaseOrigin ||
            !requestUrl.pathname.startsWith(restPrefix)
          ) {
            return browserFetch(request);
          }

          const resource = requestUrl.pathname.slice(restPrefix.length);
          const proxyUrl = `${apiBaseUrl}/api/supabase-proxy/${resource}${requestUrl.search}`;
          const body =
            request.method === 'GET' || request.method === 'HEAD'
              ? undefined
              : await request.clone().arrayBuffer();

          return browserFetch(
            new Request(proxyUrl, {
              method: request.method,
              headers: request.headers,
              body,
              credentials: request.credentials,
              redirect: request.redirect,
              referrerPolicy: request.referrerPolicy,
              signal: request.signal,
            }),
          );
        },
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.',
    );
  }

  return supabase;
}
