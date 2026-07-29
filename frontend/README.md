# Pollify Frontend

A production-ready React frontend for the Pollify community polling platform, built to match your existing Express/MongoDB backend exactly (see `FRONTEND_NOTES.md` for the full backend audit and known gaps).

## Stack

React 18 + Vite · Tailwind CSS · React Router · Axios · React Hook Form · React Hot Toast · Framer Motion · Recharts · Lucide React

## Setup

```bash
npm install
cp .env.example .env
# edit .env if your backend runs somewhere other than http://localhost:5000/api
npm run dev
```

Your backend must be running and CORS-enabled for `http://localhost:5173` (Vite's default dev port).

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of your Express API | `http://localhost:5000/api` |

## Project structure

```
src/
  api/            Axios client + one module per backend resource (auth, polls, comments, notifications, users)
  components/
    ui/           Reusable primitives (Button, Modal, Avatar, Input, EmptyState, etc.)
    layout/       Navbar, Sidebar, AppShell, AuthShell, ThemeToggle, NotificationBell
    polls/        PollCard, PollVoter (handles all 5 poll types)
    comments/     CommentThread (builds the reply tree client-side)
    skeletons/    Loading skeletons
  context/        AuthContext, ThemeContext
  hooks/          usePolls, useDebounce, useClickOutside
  pages/          One file per route, plus pages/auth for the auth flow
  routes/         ProtectedRoute
  utils/          formatTime, buildCommentTree, pollMeta
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

## Known gaps vs. the original feature spec

These were intentionally left out or adapted because the backend doesn't support them yet. See `FRONTEND_NOTES.md` for details and suggested backend additions:

- Separate "Likes" (only bookmarks/saves exist)
- True real-time voting (no WebSocket layer — falls back to 8s polling on the poll details page)
- Full-text search (client-side filter for now; recommend adding `?q=` to `GET /api/polls`)
- Multi-select polls, poll expiration, visibility, tags, anonymous voting (no matching fields on the Poll model)
