# Charity Events Platform — Startup Guide (Frontend & Backend)

This project is a full-stack charity events platform built with Vue 3, TypeScript, Vite, and a Node.js (Express) backend. It supports searching and viewing event details, fundraising progress, and demo registration flows.

## Overview

- Frontend: Vue 3 + TypeScript + Vite (`src/`)
- Backend: Express server (`server/server.js`) with MySQL or demo mode (`server/server-demo.js`)
- Proxy: Frontend proxies API requests to the backend via `/api`
- Optional: PHP static server for `/uploads` assets (dev only)

## Prerequisites

- Node.js 18+ (recommended)
- MySQL 8+ (for database-backed mode)
- Git

## Quick Start

1) Install dependencies

```bash
cd demo1
npm install
```

2) Configure environment variables for the backend

Create `server/.env` and set values. To match the Vite proxy, use `PORT=5051`.

```env
# server/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=charityevents_db
DB_PORT=3306
PORT=5051
```

3) Start the backend (choose ONE mode)

- Database-backed mode (requires a running MySQL with the schema loaded):

```bash
npm run server         # runs server/server.js
# or hot-reload during development
npm run dev:server     # runs server/server.js with nodemon
```

- Demo mode (no database required):

```bash
node server/server-demo.js
```

Backend endpoints to verify:

- Health: `http://localhost:5051/api/health` (adjust port if changed)
- Events: `http://localhost:5051/api/events`

4) Optional — start PHP static server for uploads (dev only)

If you need `/uploads` assets locally, serve `public/` via PHP:

```bash
# Example (Windows):
php -S localhost:8000 -t public
```

The frontend proxy maps `/uploads` to `http://localhost:8000` in development.

5) Start the frontend

```bash
npm run dev
```

Frontend dev server: `http://localhost:5176` (configured in `vite.config.ts`).

## Build & Preview

```bash
npm run build      # type-check + build
npm run preview    # serve the production build at http://localhost:4173
```

## Configuration Reference

- API base URL (frontend):
  - Dev: automatically uses relative `/api` via Vite proxy
  - Prod: set `VITE_API_BASE_URL` (e.g., `https://your-domain.com/api`)

`src/services/api.ts` resolves:

```ts
export const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5051/api')
```

## Directory Structure

```
demo1/
├── src/                # Vue app source
│   ├── components/     # Reusable UI components
│   ├── composables/    # GSAP animations and utilities
│   ├── services/       # API service and types
│   ├── views/          # Pages (Home, Search, EventDetail, etc.)
│   ├── router/         # Vue Router configuration
│   └── style.css       # Global styles
├── server/             # Backend (Express)
│   ├── server.js       # Database-backed server
│   ├── server-demo.js  # Demo server (mock data, no DB)
│   ├── event_db.js     # DB connector
│   └── .env            # Backend environment config
├── vite.config.ts      # Vite config with dev proxies
├── package.json        # Scripts for both front & back
└── README.md           # Chinese documentation
```

## Available NPM Scripts

```bash
# Frontend dev server
npm run dev

# Backend server (database-backed)
npm run server

# Backend server with hot reload
npm run dev:server

# Build and preview production bundle
npm run build
npm run preview
```

## API Endpoints (Demo/DB modes)

- `GET /api/health` — Backend health status
- `GET /api/events` — Events list for Home page
- `GET /api/events/:id` — Event details
- `GET /api/locations` — Distinct location list for Search page
  
Search endpoints may vary by backend; the frontend uses helper methods in `src/services/api.ts`. In dev, Search.vue can also call `/api/active/article/search` (via proxy). Adjust your backend accordingly.

## Development Notes

- Vite dev proxy (in `vite.config.ts`):

```ts
server: {
  port: 5176,
  proxy: {
    '/api': { target: 'http://localhost:5051', changeOrigin: true, secure: false },
    '/uploads': { target: 'http://localhost:8000', changeOrigin: true, secure: false }
  }
}
```

- Ensure your backend port equals the proxy target (`5051`) or update the proxy if you use a different port.
- For production, configure `VITE_API_BASE_URL` so the frontend points to your deployed backend.

## Troubleshooting

- Frontend cannot reach API
  - Confirm backend is running and port matches Vite proxy (`5051`)
  - Check CORS and firewall settings
  - Verify `API_BASE_URL` resolution in production

- Database connection fails
  - Verify MySQL service is running and reachable
  - Check credentials in `server/.env`
  - Ensure schema is imported into `charityevents_db`

- Images not loading
  - Confirm correct `image_url` paths
  - Use the PHP static server (`/uploads`) in dev if needed

## License

MIT License

---
For Chinese documentation, please refer to `README.md`.