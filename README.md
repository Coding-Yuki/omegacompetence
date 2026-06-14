# OMEGA COMPETENCE — IT Helpdesk System

A modern IT support ticket management system built with Next.js, Prisma, and SQLite. Employees can submit support tickets; IT admins can track, assign, and resolve them from a dashboard with audit logging and SLA monitoring.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16 + React 19 | Server-rendered pages and client UI |
| Styling | Tailwind CSS 4 + shadcn/ui | Utility-first CSS with pre-built components |
| Database | SQLite via Prisma | File-based relational database, zero-setup |
| Auth | bcryptjs + JWT | Password hashing and stateless auth tokens |
| Validation | Zod | Schema validation for forms |
| Animations | Framer Motion | UI transitions and micro-interactions |
| Charts | Recharts | Admin dashboard trend charts |
| Notifications | Sonner | Toast notifications |

## Prerequisites

- **Node.js** 18+ installed
- **npm** (comes with Node.js)

## Setup (from scratch)

```bash
# 1. Clone the repository
git clone <repo-url>
cd omega-main

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and set JWT_SECRET to a random string,
# and ADMIN_SECRET_CODE to your preferred admin registration code.

# 4. Generate Prisma client and create the database
npx prisma generate
npx prisma migrate deploy

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database starts empty. Register a new user (leave the admin code blank) to create an employee account. To create an admin account, enter the `ADMIN_SECRET_CODE` from your `.env` file during registration.

## Project Structure

```
src/
  app/
    page.tsx              Login page
    register/page.tsx     Registration page
    my-tickets/page.tsx   Employee ticket dashboard
    admin/page.tsx        Admin dashboard
    actions.ts            Server Actions (all database operations)
    layout.tsx            Root layout with theme provider
    globals.css           Global styles and design tokens
    error.tsx             Global error boundary
    not-found.tsx         404 page
  components/
    navbar.tsx            Navigation bar
    SmartTicketForm.tsx   Ticket submission form with keyword detection
    TicketDetailPanel.tsx Slide-over ticket detail view
    command-menu.tsx      Ctrl+K command palette
    HoloLock.tsx          Password strength visual indicator
    GenerativeAvatar.tsx  Avatar with initials
    theme-provider.tsx    Dark/light theme context
    theme-toggle.tsx      Theme switch button
    ui/                   shadcn/ui primitive components
  hooks/
    useAuth.ts            Session state hook
    useNetworkStatus.ts   Online/offline detection
  lib/
    prisma.ts             Prisma client singleton
    validations.ts        Zod schemas for forms
    utils.ts              Tailwind class merging utility
prisma/
  schema.prisma           Database schema (User, Ticket, AuditLog)
  migrations/             Database migrations
scripts/
  dump_db.js              Dev utility to inspect database contents
  update_ticket.js        Dev utility to update ticket status
  inspect_users.js        Dev utility to list users
```

## Features

- **Email/password authentication** with JWT session cookies (httpOnly)
- **Role-based access** — employees see only their tickets, admins see everything
- **Smart ticket form** — auto-detects category from description keywords, suggests self-service solutions
- **Admin dashboard** — KPIs, 7-day trend chart, audit log feed, searchable/filterable ticket table
- **SLA monitoring** — countdown timer on high-priority tickets with 2-hour resolution target
- **Audit trail** — every ticket action is logged with timestamp and actor
- **Command palette** — Ctrl+K quick actions
- **Dark/light themes**

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `node scripts/dump_db.js` | Print database contents |
| `node scripts/update_ticket.js <id> <status>` | Update ticket status from CLI |
| `node scripts/inspect_users.js` | List registered users |
| `npx prisma studio` | Database GUI at http://localhost:5555 |
