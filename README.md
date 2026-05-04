# Xom Appétit — Frontend

Web app for **Xom Appétit**, a home-cooking tracker. Built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Log meals, ingredients, and cooking steps; filter and rate them in a responsive dark-themed UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

## Features

- **Table & Card Views** — Toggle between a data-dense table and visual card layout
- **Filterable** — Filter meals by protein source, difficulty, cooked status, and time range
- **Add Meal Modal** — Log meals with name, time, difficulty, protein source, ingredients, and macros
- **Rate Meal Modal** — Rate meals on taste, ease, speed, and healthiness (1–10) with notes
- **Real-time Data** — SWR-powered data fetching with optimistic updates
- **Dark Theme** — Sleek gray-800/900 dark UI
- **Mobile Responsive** — Responsive grid layouts that work on any screen size

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Data Fetching | [SWR](https://swr.vercel.app/) |
| API | Verb-style → [api.xomappetit.xomware.com](https://api.xomappetit.xomware.com) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/Xomware/xomappetit-frontend.git
cd xomappetit-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Start dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | yes | Base URL for the Meals API | `https://api.xomappetit.xomware.com` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | yes | Cognito user pool ID | `us-east-1_xxxxxxxxx` |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | yes | xomappetit Cognito app client ID | — |
| `NEXT_PUBLIC_COGNITO_DOMAIN` | optional | Hosted UI domain (needed for federated sign-in) | `xomware-auth.auth.us-east-1.amazoncookie.com` |
| `NEXT_PUBLIC_AWS_REGION` | yes | AWS region for the user pool | `us-east-1` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | optional | Google Analytics 4 measurement ID — when unset, analytics no-op | `G-XXXXXXXXXX` |

See `.env.example` for a template.

## Authentication

The app uses **AWS Cognito** via **Amplify v6** for auth. Sessions are JWT-based; every API request goes out with `Authorization: Bearer <id-token>`.

- Sign-up / sign-in / forgot-password live under `/auth/*`.
- Hosted UI federated sign-in (Google) lands at `/auth/callback`. The Google button is currently stubbed — Phase 4 wires the IdP.
- Route protection is **client-side** because the app is a Next.js static export — middleware is not available. Protected pages call `useRequireAuth()` from `src/lib/auth-context.tsx`, which redirects unauthenticated users to `/auth/sign-in?next=<path>`.

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles & Tailwind imports
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page (view toggle, filters, meal list)
├── components/
│   ├── AddMealModal.tsx   # Modal for adding new meals
│   ├── FilterBar.tsx      # Filter controls (protein, difficulty, cooked, time)
│   ├── MealCard.tsx       # Card view for a single meal
│   ├── MealTable.tsx      # Table view for meals
│   ├── Modal.tsx          # Reusable modal wrapper
│   └── RateMealModal.tsx  # Modal for rating meals (taste/ease/speed/health)
├── lib/
│   ├── hooks.ts           # SWR hooks for data fetching & mutations
│   └── storage.ts         # Local storage utilities
└── types.ts               # TypeScript type definitions
```

## API Integration

The app communicates with a REST API at `api.xomappetit.xomware.com` backed by API Gateway + DynamoDB. All requests carry a Cognito-issued JWT in the `Authorization: Bearer <token>` header.

Key endpoints:
- `GET /meals` — Fetch all meals
- `POST /meals` — Create a new meal
- `PUT /meals/:id` — Update a meal (including ratings)

SWR handles caching, revalidation, and optimistic updates for a snappy UI experience.

## Deployment

The app deploys automatically via **GitHub Actions** (`.github/workflows/deploy.yml`).

Supported deployment targets:
- **Vercel** — Zero-config Next.js hosting
- **S3 + CloudFront** — Static export to AWS (via GitHub Actions)

## License

Private — Xomware
