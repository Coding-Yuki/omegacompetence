# OMEGA - Setup Guide

## Quick Start

### 1. Firebase Configuration (Required)

The project requires Firebase for authentication. Follow these steps:

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or select existing project)
3. Follow the setup wizard
4. Enable Google Analytics (optional)

#### Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in method:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. (Optional) Enable **Google** sign-in method:
   - Click on "Google"
   - Toggle "Enable"
   - Set project support email
   - Click "Save"

#### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **web** icon (</>) to add a web app
4. Register your app with a nickname (e.g., "OMEGA Web")
5. Copy the configuration values

#### Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
   DATABASE_URL="file:./prisma/dev.db"
   ```

### 2. Database Setup

Initialize the SQLite database with Prisma:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database schema
- Generate the Prisma client
- Create initial migration files

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Create Admin Account

1. Click "Démarrer l'intégration" on the login page
2. Fill in your details
3. Enter the admin access code: `OMEGA-COMPETENCE-2026`
4. Submit to create an admin account

## Troubleshooting

### "Failed to fetch" errors
- Check that your Firebase configuration is correct
- Ensure all `NEXT_PUBLIC_*` variables are set in `.env.local`

### Database errors
- Delete `prisma/dev.db` and run `npx prisma migrate dev` again
- Or run `npx prisma migrate reset --force` to reset

### Authentication not working
- Verify Email/Password is enabled in Firebase Console
- Check that your Firebase project is correctly configured
- Clear browser cache and cookies

### Google Sign-In not working
- Ensure Google provider is enabled in Firebase Console
- Add `http://localhost:3000` to authorized domains in Firebase
- Check that `googleProvider` is imported in `src/lib/firebase.ts`

## Firebase Security Rules (Optional)

If you plan to use Firestore in the future, here are recommended security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use environment variables in your deployment platform (Vercel, etc.)
- Keep `.env.example` as a template

### Database
- For production, consider using PostgreSQL instead of SQLite
- Update `prisma/schema.prisma` provider and `DATABASE_URL`

### Firebase
- Set up Firebase App Check for additional security
- Configure authorized domains for production
- Enable Cloud Firestore if needed for real-time features

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)