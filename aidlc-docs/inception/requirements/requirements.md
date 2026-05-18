# Requirements: Housing Society Library Web App

## Intent Analysis
- **Request Type**: New Project (greenfield)
- **Scope**: Full-stack web application
- **Complexity**: Moderate (multi-feature app with integrations)
- **Deployment**: Zero-cost GitHub-based stack

## Functional Requirements

### FR-1: User Authentication
- 488 pre-generated accounts (one per flat)
- Credentials: flat number + default password, forced change on first login
- User profile: flat number, resident name, WhatsApp number, email

### FR-2: Book Checkout (Borrowing)
- Admin/volunteer scans ISBN barcode via smartphone camera
- Book added to catalog automatically if not already present (ISBN lookup for metadata)
- Due date set at checkout: admin chooses 1 week or 2 weeks
- Limit: 1 book per resident at a time (admin-configurable)

### FR-3: Book Return
- Two options: scan ISBN barcode OR search by borrower name/flat number
- Mark book as returned, update availability

### FR-4: Book Catalog
- No initial catalog — built organically through checkouts
- Fields: ISBN, title, author (fetched from ISBN API), availability status

### FR-5: WhatsApp Reminders
- Via Meta Cloud API (WhatsApp Business API free tier — 1000 conversations/month)
- Reminder sent 2 days before due date
- Overdue notification sent to admins (not blocking borrower)

### FR-6: Admin Dashboard
- Checkout/return management
- View overdue books
- Manage user accounts (reset passwords, disable accounts)
- Configure borrowing limit

### FR-7: Volunteer System
- Residents can volunteer to sit in library
- Accepting a volunteer request grants them temporary admin access for that day only
- Access auto-expires at end of day

### FR-8: Photo Capture
- SKIPPED — cost concern for image storage on free tier

## Non-Functional Requirements

### NFR-1: Zero Cost Deployment
- **Recommended Stack**: GitHub Pages (frontend) + Supabase free tier (backend/DB/auth) + GitHub Actions (cron for reminders)
- Rationale: Supabase free tier gives 500MB DB, 1GB file storage, 50K monthly active users, built-in auth, and Edge Functions — all sufficient for 488 users

### NFR-2: Mobile-First
- Primary usage via smartphone (barcode scanning)
- Responsive web app, no native app needed

### NFR-3: Security Level
- Prototype/community-app level (security extensions disabled)
- Basic auth via Supabase Auth (email/password)

## Tech Stack Decision
| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React (Vite) on GitHub Pages | Free |
| Backend/API | Supabase (PostgreSQL + Edge Functions) | Free tier |
| Auth | Supabase Auth | Free tier |
| Barcode Scanning | QuaggaJS or html5-qrcode (client-side) | Free |
| WhatsApp | Meta Cloud API (WhatsApp Business) | Free tier (1000 conv/mo) |
| Cron Jobs | GitHub Actions (scheduled) | Free (2000 min/mo) |
| ISBN Metadata | Open Library API | Free |
