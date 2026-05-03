# Rozgar Connect

## Overview

A full-stack Pakistani skilled labor marketplace connecting customers with local skilled workers. Built as a pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/rozgar-connect)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Validation**: Zod (lib/api-zod), Orval codegen (lib/api-spec)
- **Auth**: express-session + bcrypt (phone + password)
- **Session store**: connect-pg-simple (PostgreSQL)
- **API codegen**: Orval (from OpenAPI spec → React Query hooks)
- **Build**: esbuild (CJS bundle)

## Features

### Customer
- Signup/Login with phone, password, city
- Browse workers by category and city
- View worker profiles with ratings and PKR hourly rates
- Book a worker (date, time, address)
- Rate and review workers after completed jobs

### Worker
- Signup/Login (adds name, phone, skill, city, hourly rate)
- Automatically appears in customer browse after signup
- View and accept/reject booking requests
- View all received reviews

## Dummy Workers (password: password123)
- Muhammad Ali (Plumber, Rawalpindi) — 03001111111
- Tariq Mehmood (Electrician, Islamabad) — 03002222222
- Asif Khan (Carpenter, Rawalpindi) — 03003333333
- Raza Ahmed (Painter, Islamabad) — 03004444444
- Naveed Iqbal (Cleaner, Rawalpindi) — 03005555555

## Cities
Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Architecture

- `artifacts/rozgar-connect/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express API server (served at `/api`)
- `lib/db/` — Drizzle ORM schema and DB connection
- `lib/api-spec/` — OpenAPI spec + Orval config
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validators

## DB Schema

- `users` — customers and workers (userType enum)
- `worker_profiles` — worker details (skill, hourlyRate, avgRating, totalReviews)
- `bookings` — booking requests with status (pending/accepted/rejected/completed)
- `reviews` — customer reviews with rating (1-5) and comment

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
