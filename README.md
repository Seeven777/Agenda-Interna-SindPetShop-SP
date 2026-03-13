# Union Internal Agenda

Internal operational hub for workers union team management. Designed as a mobile-first Progressive Web App (PWA).

## Features

- **Dashboard**: Real-time overview of agenda, hearings, and tasks.
- **Calendar**: Manage union activities and events.
- **Legal Module**: Case management system for legal staff.
- **Task Management**: Internal task tracking with priority and status.
- **Announcements**: Official internal communications.
- **PWA**: Installable on iOS and Android with offline support.
- **RBAC**: Role-based access control (Admin/Staff).

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Lucide Icons, Motion.
- **Backend**: Firebase (Auth, Firestore, Storage).
- **Build Tool**: Vite.

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd union-internal-agenda
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
Create a `.env` file based on `.env.example` and add your Firebase credentials.
```env
GEMINI_API_KEY=your_key
APP_URL=your_app_url
```
Also ensure `firebase-applet-config.json` is present in the root directory.

### 4. Run development server
```bash
npm run dev
```

### 5. Deploy to Vercel
Connect your repository to Vercel and it will automatically deploy based on the `vite.config.ts`.

## Database Structure (Firestore)

- `users`: User profiles and roles.
- `events`: Calendar events.
- `cases`: Legal department cases.
- `tasks`: Staff tasks.
- `announcements`: Internal news.

## Permissions

- **Admin**: Full access to all modules, user management, and announcements.
- **Staff**: View all content, manage tasks and events.

## PWA Installation

1. Open the app in your mobile browser.
2. Tap "Share" (iOS) or the three dots (Android).
3. Select "Add to Home Screen".
