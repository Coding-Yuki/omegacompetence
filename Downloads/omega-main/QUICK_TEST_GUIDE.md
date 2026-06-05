# Quick Test Guide

## Prerequisites

1. **Firebase Setup** (Required - 5 minutes):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (or use existing)
   - Enable **Authentication** → **Email/Password** sign-in
   - Copy the web app config values
   - Paste them into `.env.local` (replace the placeholder values)

2. **Start the server**:
   ```bash
   npm run dev
   ```
   Server runs at: http://localhost:3000

---

## 1. Check Users in Database

### View database directly:
```bash
npx prisma studio
```
Opens a web GUI at http://localhost:5555 where you can see all users, tickets, and audit logs.

### Or view via command line:
```bash
npx prisma db seed  # (if seed file exists)
```

---

## 2. Test as Employee

1. **Register an employee account**:
   - Go to http://localhost:3000
   - Click "Démarrer l'intégration" (Start Integration)
   - Fill in: Name, Email, Password
   - **Leave admin code field EMPTY**
   - Click "Valider l'empreinte"

2. **You'll be redirected to** `/my-tickets` (Employee Dashboard)

3. **Create a ticket**:
   - Click "Initialiser Requête" button
   - Fill in the form:
     - Subject: "Test ticket"
     - Description: Type anything (the AI will suggest category)
     - Priority: Select any
   - Click "Émettre la requête"

4. **View your ticket**:
   - Ticket appears in the list below
   - Shows status: "En traitement IA" (In progress)

5. **Log out**:
   - Click "Déconnexion" in navbar

---

## 3. Test as Support Admin

1. **Register an admin account**:
   - Go to http://localhost:3000
   - Click "Démarrer l'intégration"
   - Fill in: Name, Email, Password
   - **Enter admin code**: `OMEGA-COMPETENCE-2026`
   - Click "Valider l'empreinte"

2. **You'll be redirected to** `/admin` (Admin Dashboard)

3. **View all tickets**:
   - See KPIs at top (total, active, urgent, resolved)
   - See 7-day chart
   - See audit trail on the right
   - See all tickets in the table below

4. **Manage a ticket**:
   - Find a ticket in the table
   - Hover over the row → click the three dots (⋮) on the right
   - Select "Purger l'anomalie" to mark as resolved
   - Or "Réactiver le flux" to reopen

5. **Use filters**:
   - Search by title or ID
   - Filter by status: "Anomalies Actives" / "Noeuds Réparés"
   - Filter by priority: "Alerte Rouge" / "Avertissement" / "Normale"

6. **Log out**:
   - Click "Déconnexion" in navbar

---

## Quick Verification Checklist

- [ ] Server running at http://localhost:3000
- [ ] Can register employee (no admin code)
- [ ] Employee sees `/my-tickets` dashboard
- [ ] Employee can create ticket
- [ ] Can register admin (with code `OMEGA-COMPETENCE-2026`)
- [ ] Admin sees `/admin` dashboard with all tickets
- [ ] Admin can change ticket status
- [ ] `npx prisma studio` shows data