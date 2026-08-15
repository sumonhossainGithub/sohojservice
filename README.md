# SohojService

A free hyperlocal service marketplace — customers find and book verified local
professionals (electricians, plumbers, tutors, mechanics, and more). No fees,
no middleman.

This is a rebuild of the original SohojService using a different, more
reliable stack:

| | Original | This version |
|---|---|---|
| Database toolkit | Prisma | **Drizzle ORM** |
| Database connection | Direct TCP (needs IPv6) | **Neon HTTP driver** (plain HTTPS, works anywhere) |
| Auth | NextAuth (beta) | **Custom** — bcrypt + signed cookies (`jose`) |

The database and auth issues that caused problems before (Prisma's native
binary download, Supabase's IPv6-only direct connection) don't exist in this
version — Drizzle is pure JavaScript, and Neon's HTTP driver talks to the
database the same way a browser talks to a website, over regular HTTPS.

This guide assumes **you know nothing about deploying a website**. Follow it
top to bottom, in order.

---

## Part 1 — Get the code onto your computer

### 1. Install Node.js

1. Go to **[nodejs.org](https://nodejs.org)**, download the **LTS** version, install with default options.
2. Confirm it worked — open Command Prompt / PowerShell (Windows) or Terminal (Mac) and run:
   ```
   node -v
   ```

### 2. Get a free GitHub account

Go to **[github.com](https://github.com)** and sign up.

### 3. Install Git

Go to **[git-scm.com/downloads](https://git-scm.com/downloads)**, install with default options.

### 4. Upload this project to GitHub

In your terminal, inside this project folder:

```bash
git init
git add .
git commit -m "Initial commit"
```

On GitHub.com: click **+** → **New repository** → name it `sohojservice` → **Create repository**. Then run the commands GitHub shows you (they'll look like this, with your own username):

```bash
git remote add origin https://github.com/YOUR-USERNAME/sohojservice.git
git branch -M main
git push -u origin main
```

---

## Part 2 — Create your free database (Neon)

1. Go to **[neon.com](https://neon.com)** → **Sign up** (GitHub login works)
2. **Create a project** → name it `sohojservice` → pick a region near Bangladesh (e.g. Singapore) → **Create project**
3. On the dashboard, copy the **Connection string** shown — looks like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save it somewhere — you'll need it in the next two parts.

That's it — no "pooler vs direct connection" choice to worry about this time, since this app talks to Neon over HTTPS regardless of which string you copy.

---

## Part 3 — Run it on your own computer first

1. In the project folder, create a file named exactly `.env` containing:
   ```
   DATABASE_URL="paste-your-neon-connection-string-here"
   AUTH_SECRET="any-random-string-here"
   ```
   Generate a proper `AUTH_SECRET` at **[generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)** if you want one that's truly random.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the database tables:
   ```bash
   npm run db:push
   ```

4. Load starter data (categories + a demo admin and professional login):
   ```bash
   npm run db:seed
   ```

5. Start the site:
   ```bash
   npm run dev
   ```

6. Open **http://localhost:3000** in a real browser (Chrome/Edge — not an editor's built-in preview).

### Demo accounts

- **Admin:** `admin@sohojservice.com` / `admin1234`
- **Demo professional:** `karim.electrician@example.com` / `pro12345`

Change or delete these before real users sign up.

---

## Part 4 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Sign up** → **Continue with GitHub**
2. **Add New…** → **Project** → import your `sohojservice` repository
3. Expand **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | same Neon connection string from Part 2 |
   | `AUTH_SECRET` | same value you used in `.env` |

4. Click **Deploy**. Takes 1-2 minutes.
5. Visit your new `.vercel.app` URL — since you already ran `db:push` and `db:seed` against the same Neon database in Part 3, the live site will already have categories and demo accounts. No extra step needed.

---

## Part 5 — Connect your own domain (optional)

1. Buy a domain (Namecheap, GoDaddy, or a local `.com.bd` registrar)
2. In Vercel: your project → **Settings** → **Domains** → add your domain
3. Add the DNS records Vercel shows you at your domain registrar
4. Wait for the DNS to propagate (10 minutes to a few hours)

---

## Making changes later

```bash
npm run dev          # local development
npm run db:studio    # visual database editor in your browser
```

To view/edit the database structure itself, edit `db/schema.ts`, then run
`npm run db:push` again to sync the change to Neon.

To publish code changes:

```bash
git add .
git commit -m "describe what you changed"
git push
```

Vercel redeploys automatically on every push.

---

## How the app works

- **Customers** register, browse professionals by category/area, and send a free booking request.
- **Professionals** register, fill in a listing (category, area, bio, rate), and manage incoming requests — accept, decline, or mark completed.
- **Admins** see all professional listings and toggle a "Verified" badge.
- Language toggle (top-right, EN / বাং) switches all interface text between English and Bengali.

## What's built vs. what's still to add

**Built:** registration/login for all three roles, browsing with search/filter, booking requests, accept/decline/complete flow, reviews after completed jobs, admin verification, English/Bengali toggle, mobile-responsive design.

**Not yet built:**
- Real-time chat between customer and professional
- A map-based location picker (area is currently free-text)
- SMS/email notifications
- Photo uploads for professional profiles

## Troubleshooting

- **Site loads but shows empty categories** — you haven't run `npm run db:push` and `npm run db:seed` against the database Vercel is using. Both must point at the same `DATABASE_URL`.
- **"DATABASE_URL is not set" error** — your `.env` file (local) or Vercel environment variable (deployed) is missing or misnamed. It must be exactly `DATABASE_URL`.
- **Locked out of admin** — run `npm run db:studio`, open the `users` table, find your row, change `role` to `ADMIN`.
