# G-Scores — Vietnam National High School Exam 2024 Analytics

A full-stack web application for importing, searching, and analyzing the 2024 Vietnam National High School Exam score dataset (over 1 million students).

Built with NestJS, React (Vite), TypeScript, Prisma ORM, PostgreSQL, and Docker.

---

## 🏗️ Project Architecture

This project is structured as an npm workspaces monorepo:

- **`apps/api`** — NestJS backend API powered by Prisma ORM + PostgreSQL
- **`apps/web`** — React SPA frontend compiled with Vite, using TanStack Query and Recharts

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Recharts, Lucide React
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, class-validator
- **DevOps**: Docker, Docker Compose, Nginx

---

## 🚀 Running Locally

### Prerequisites

- Node.js v20+
- PostgreSQL running locally **or** via Docker (see below)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL

The easiest way is to spin up only the database container:

```bash
docker-compose up -d db
```

This starts PostgreSQL 15 on port `5432` with:
- User: `postgres`
- Password: `postgrespassword`
- Database: `gos_exam_analytics`

### 3. Configure Environment

The `apps/api/.env` file is already pre-configured for the Docker PostgreSQL above:

```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/gos_exam_analytics?schema=public"
PORT=3000
```

If you are using a different PostgreSQL instance, update `DATABASE_URL` accordingly.

### 4. Push Database Schema

```bash
npx prisma db push --schema=apps/api/prisma/schema.prisma
```

### 5. Import Exam Data

Place the raw CSV file at `data/diem_thi_thpt_2024.csv` (relative to project root), then run:

```bash
npm run data:import
```

This streams and batch-inserts 1M+ student records in under 2 minutes.

### 6. Start the App

Open two terminal tabs and run:

```bash
# Terminal 1 — API (http://localhost:3000)
npm run dev:api

# Terminal 2 — Web (http://localhost:5173)
npm run dev:web
```

---

## 🐳 Docker Deployment

Run the full stack (PostgreSQL + API + Web) with a single command:

```bash
docker-compose up --build
```

> **Note:** `VITE_API_URL` is baked into the frontend at build time. For deployment to a remote server, set it before building:
> ```bash
> VITE_API_URL=https://api.yourdomain.com docker-compose up --build
> ```

Services:
1. **`db`** — PostgreSQL 15 with health check
2. **`api`** — NestJS API on port `3000` (auto-migrates schema on startup)
3. **`web`** — Nginx-served React app on port `80`

---

## 🧪 Running Tests

```bash
# Backend unit tests
npm run test:api

# Frontend component tests
npm run test:web
```

---

## 🔌 API Reference

### `GET /api/exam-results/:registrationNumber`

Look up individual student scores by registration number (SBD).

```json
{
  "data": {
    "registrationNumber": "01000001",
    "scores": {
      "math": 8.4,
      "literature": 6.75,
      "foreignLanguage": 7.5,
      "physics": 6.0,
      "chemistry": 5.25,
      "biology": null,
      "history": null,
      "geography": null,
      "civicEducation": null
    }
  }
}
```

### `GET /api/reports/score-distribution`

Score distribution across 4 performance bands for all subjects.

```json
{
  "data": [
    {
      "subject": "math",
      "label": "Mathematics",
      "levels": {
        "GTE_8": 198392,
        "GTE_6_LT_8": 505836,
        "GTE_4_LT_6": 258654,
        "LT_4": 82731
      }
    }
  ]
}
```

### `GET /api/rankings/group-a?limit=10`

Top students by combined Math + Physics + Chemistry score (Group A).

```json
{
  "data": [
    {
      "registrationNumber": "01000001",
      "totalScore": 29.5,
      "scores": { "math": 10.0, "physics": 9.75, "chemistry": 9.75 }
    }
  ]
}
```
