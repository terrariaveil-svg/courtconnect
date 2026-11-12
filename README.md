# CourtConnect

CourtConnect uses a React/Vite frontend, a Python/FastAPI backend, and Supabase Auth/Postgres. Sign-in is handled by Supabase Auth. Database REST and RPC requests from the frontend are proxied through FastAPI, where the user's Supabase access token is forwarded and Postgres row-level security remains active. The app does not use a `service_role` key.

## Configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql) once. It creates the profile trigger, app tables, seed events, row-level security policies, and approval/registration functions.
3. Run [`supabase/profile_address.sql`](./supabase/profile_address.sql), [`supabase/booking_availability.sql`](./supabase/booking_availability.sql), [`supabase/booking_cancellation.sql`](./supabase/booking_cancellation.sql), [`supabase/booking_review.sql`](./supabase/booking_review.sql), [`supabase/admin_booking_visibility.sql`](./supabase/admin_booking_visibility.sql), [`supabase/court_ownership.sql`](./supabase/court_ownership.sql), [`supabase/event_registration_cancellation.sql`](./supabase/event_registration_cancellation.sql), and [`supabase/facility_ratings.sql`](./supabase/facility_ratings.sql) in the SQL Editor to enable saved profile addresses, safe live court booking availability, booking cancellation and review, administrator access to all booking records, owner-only management of approved courts, viewing bookings for owned courts, event registration cancellation, and user-submitted facility ratings. Existing projects should run these migrations and the Realtime migration only; do not rerun the full schema.
4. Run [`supabase/realtime.sql`](./supabase/realtime.sql) in the SQL Editor to enable live updates for app tables.
5. In **Project Settings → API**, copy the project URL and the publishable (or legacy anon) key. Do not use a `service_role` key in the browser.
6. Copy the root `.env.example` to `.env.local` and fill in:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

7. In **Authentication → URL Configuration**, add the app's local and deployed URLs to the allowed redirect URLs (for example `http://localhost:5173/**`).
8. To grant administrator access, create and confirm an account through CourtConnect, then run this in the SQL Editor using that account's Auth user UUID:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = 'AUTH-USER-UUID';
   ```

   New registrations always receive the `client` role; do not make a client-editable role setting.
9. Restart Vite after changing environment variables:

   ```sh
   npm install
   npm run dev
   ```

10. Configure and run the Python backend in a second terminal:

   ```powershell
   py -m venv .venv
   .venv\Scripts\python.exe -m pip install -r backend\requirements.txt
   Copy-Item backend\.env.example backend\.env
   .venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

   Fill `backend/.env` with the same Supabase project URL and publishable key. During development, Vite forwards `/api` requests to `http://127.0.0.1:8000`. Keep both terminals running. You can check the API at `http://127.0.0.1:8000/health`.

The root `.env.local` is still needed for Supabase Auth in the browser. The browser only sends requests to FastAPI for database REST/RPC operations; FastAPI uses the user's access token with the publishable key, so Supabase row-level security remains responsible for authorization. For production, deploy FastAPI and set `VITE_API_URL` to its HTTPS origin when building the frontend; add that frontend URL to `FRONTEND_ORIGINS` in the backend environment. Never put a database password or `service_role` key in frontend code or environment variables prefixed with `VITE_`.

The app refuses local-only sign-in when Supabase is not configured. Sign-up, password reset, profiles, bookings, custom courts, court requests, events, event registrations, and recent visits use Supabase. Supabase Realtime updates loaded records when subscribed tables change, with a 15-second refresh fallback while signed in; Vite's development server also hot-reloads frontend code changes. Row-level security restricts personal records to their owner and administrative operations to accounts with the `admin` profile role.

## Deploy

This repository includes a Render Blueprint in [`render.yaml`](./render.yaml) for a static frontend and a FastAPI web service. In Render, choose **New → Blueprint**, connect this repository, and follow the prompts for the environment variables marked as secret/manual:

- **Frontend:** set `VITE_SUPABASE_URL` to the Supabase project base URL (without `/rest/v1`), `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key, and `VITE_API_URL` to the full HTTPS URL of the deployed `courtconnect-api` service.
- **Backend:** set `SUPABASE_URL` to the same Supabase project base URL, `SUPABASE_PUBLISHABLE_KEY` to its publishable key, and `FRONTEND_ORIGINS` to the exact HTTPS URL of the deployed `courtconnect` static site (no trailing slash).

After both services are created, update the two Render URLs in their environment variables if needed and trigger a frontend redeploy so its API URL is compiled into the Vite build. Verify the backend's `/health` endpoint responds with `{"status":"ok"}`.

- **Secrets:** the Supabase publishable key is intended for browser use and is embedded in the frontend build. Never use a database password or `service_role`/secret key in a `VITE_` variable.
- **Supabase Auth:** set the production frontend URL as the Site URL and add the production URL and any required password-reset or email-confirmation callback URLs to the allowed redirect URLs.
- **Database:** apply the schema and migrations described above to the same Supabase project used by both services before enabling bookings, court ownership, profile address editing, or realtime updates.

## Import existing browser records

After signing in with a Supabase account, open the profile and choose **Import records from this browser**. The one-time import transfers that browser's recent visits and the signed-in user's court requests. An administrator can also import custom courts saved in that browser. Requests are imported as pending and must be approved again.

Existing local passwords are never copied; create/confirm a Supabase account and set a new password. Bookings and event registrations were held only in memory by the previous version, so they cannot be imported after a page refresh.

## Checks

```sh
npm run build
npm run lint
```
