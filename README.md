# 📚 Society Library

A simple library management web app for housing societies. Zero cost deployment on GitHub's free stack.

## Features

- **488 flat accounts** with pre-generated credentials
- **ISBN barcode scanning** via smartphone camera for book checkout
- **Auto-catalog building** — books added to catalog on first checkout via Open Library API
- **Due date management** — admin sets 1 or 2 week due dates
- **WhatsApp reminders** — automated reminders 2 days before due date
- **Admin dashboard** — overdue tracking, user management, settings
- **Volunteer system** — residents can volunteer for temporary admin access

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React + TypeScript + Tailwind CSS | Free |
| Hosting | GitHub Pages | Free |
| Backend/DB | Supabase (PostgreSQL + Auth) | Free tier |
| Barcode | html5-qrcode (client-side) | Free |
| WhatsApp | Meta Cloud API | Free (1000 conv/mo) |
| Cron | GitHub Actions | Free (2000 min/mo) |
| ISBN Data | Open Library API | Free |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Note your project URL and anon key from **Settings > API**

### 2. Seed User Accounts

```bash
npm install
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
npx tsx scripts/seed-users.ts
```

Then set the first admin:
```sql
UPDATE residents SET role = 'admin' WHERE flat_number = 'A-101';
```

### 3. Configure GitHub Repository

Add these secrets in **Settings > Secrets and variables > Actions**:

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_URL` | Same as above (for Actions) |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `WHATSAPP_TOKEN` | Meta WhatsApp Business API token |
| `WHATSAPP_PHONE_ID` | Your WhatsApp Business phone number ID |

### 4. Enable GitHub Pages

1. Go to **Settings > Pages**
2. Set source to **GitHub Actions**

### 5. Deploy

Push to `main` branch — the deploy workflow will build and publish automatically.

### 6. WhatsApp Business Setup (for reminders)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create an app with WhatsApp product
3. Set up a WhatsApp Business phone number
4. Get your permanent access token and phone number ID
5. Add them as GitHub secrets (see step 3)

## Local Development

```bash
# Create .env.local with your Supabase credentials
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

npm install
npm run dev
```

## Login

- **Email format**: `flat{flatnumber}@society.library` (e.g., `flata-101@society.library`)
- **Default password**: The flat number (e.g., `A-101`)
- Users must change password on first login

## Flat Number Customization

Edit `scripts/seed-users.ts` to match your society's flat numbering scheme before running the seed script.
