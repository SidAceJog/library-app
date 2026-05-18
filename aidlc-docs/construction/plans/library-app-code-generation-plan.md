# Code Generation Plan: Library App

## Unit Context
- **Unit**: library-app (single unit, full-stack)
- **Stories**: All requirements from requirements.md
- **Dependencies**: Supabase project (user creates externally), Meta WhatsApp Business API

## Code Generation Steps

- [x] Step 1: Project scaffolding (Vite + React + TypeScript + Tailwind)
- [x] Step 2: Supabase schema (SQL migration file for tables + RLS policies)
- [x] Step 3: Supabase client setup + auth context
- [x] Step 4: Login page (flat number + password)
- [x] Step 5: First-login password change flow
- [x] Step 6: Main layout + navigation (mobile-first)
- [x] Step 7: Barcode scanner component (ISBN scanning via camera)
- [x] Step 8: Book checkout flow (scan → ISBN lookup → set due date → confirm)
- [x] Step 9: Book return flow (scan or search → mark returned)
- [x] Step 10: Resident dashboard (my borrowed books, due dates)
- [x] Step 11: Admin dashboard (overdue books, user management, borrowing config)
- [x] Step 12: Volunteer system (request to volunteer, admin approve, temp access)
- [x] Step 13: GitHub Actions workflow for WhatsApp reminders (cron)
- [x] Step 14: GitHub Actions workflow for deploying to GitHub Pages
- [x] Step 15: Seed script for 488 user accounts
- [x] Step 16: README with setup instructions

## Build Verification
- [x] TypeScript compilation: 0 errors
- [x] Vite production build: successful (3.88s)
