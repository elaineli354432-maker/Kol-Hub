# Vercel + Supabase Deployment

## Goal

Make every phone and computer open the same URL and save progress into one shared database.

## Roles

- GitHub: stores code only
- Vercel: hosts the website and API
- Supabase: stores the actual progress data

## Files already prepared

- `api/data.js`
- `api/health.js`
- `api/_lib/state-store.js`
- `deploy/supabase.sql`
- `.env.example`

## Required environment variables in Vercel

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_STATE_TABLE=app_state
SUPABASE_STATE_KEY=brandream-main
```

## Database shape

This version stores the whole app state in one shared JSON row:

- table: `public.app_state`
- primary key: `id`
- row id: `brandream-main`

This is the fastest way to bring the current prototype online without rewriting all frontend forms.

## Suggested rollout

1. Push code to GitHub
2. Create Supabase project
3. Run `deploy/supabase.sql`
4. Copy `.env.example` to `.env.local` and fill in your Supabase values
5. Run `python .\scripts\import_local_state_to_supabase.py --dry-run`
6. Run `python .\scripts\import_local_state_to_supabase.py`
7. Confirm the imported row exists in Supabase
8. Create Vercel project from GitHub repo
9. Add environment variables
10. Deploy
11. Open `/api/health` to confirm cloud mode is working
12. Open the main page and test add/edit/delete from two devices

## Optional next step

After the first online version is stable, we can upgrade from “one JSON row” to normalized tables:

- influencers
- influencer_logs
- influencer_images
- brands

That would make future filtering, audit history, and conflict handling stronger, but it is not required for the first shared online version.
