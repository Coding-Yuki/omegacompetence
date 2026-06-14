**Tech stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Prisma 6, SQLite, JWT, bcryptjs, Zod, Framer Motion, Recharts, Sonner, Lucide icons.

## Setup

```bash
git clone <repo-url> && cd omega-main
npm install
cp .env.example .env                # edit JWT_SECRET + ADMIN_SECRET_CODE
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database starts empty. Register with the admin code from `ADMIN_SECRET_CODE` in `.env` to create an admin account, or leave it blank to create an employee account.
