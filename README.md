# Vietnam National High School Exam 2024 Analytics Dashboard

A production-ready full-stack web application for importing, searching, and analyzing the 2024 Vietnam National High School Exam score dataset (over 1 million students).

Designed as a modern, high-fidelity monorepo utilising NestJS, React (Vite), TypeScript, Prisma ORM, PostgreSQL, and Docker.

---

## 🏗️ Project Architecture

This project is structured as an npm workspaces monorepo:

- **`apps/api`**: NestJS backend API, powered by Prisma ORM and PostgreSQL.
- **`apps/web`**: React SPA frontend compiled with Vite, featuring TanStack Query and Recharts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Recharts, Lucide React, Vitest.
- **Backend**: Node.js, NestJS, TypeScript, Prisma ORM, PostgreSQL, Jest, Supertest.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 💾 Local System Setup

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL running locally or on Docker

### 1. Install Dependencies

Install all monorepo dependencies from the workspace root:

```bash
npm install
```

### 2. Environment Configurations

Create a `.env` file in `apps/api/` containing your database connection credentials:

```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/gos_exam_analytics?schema=public"
PORT=3000
```

And optionally a `.env` in `apps/web/` if you want to override the backend endpoint (defaults to `http://localhost:3000`):

```env
VITE_API_URL="http://localhost:3000"
```

### 3. Generate Prisma Client & Migrate Schema

Initialize the database schema:

```bash
npx prisma db push --schema=apps/api/prisma/schema.prisma
```

---

## 📥 Ingestion: Importing Exam Scores CSV

To import the Vietnam National High School Exam scores dataset (`diem_thi_thpt_2024.csv`), place the CSV at the root path `data/diem_thi_thpt_2024.csv` and run the optimized parser stream:

```bash
npm run import -w apps/api
```

- **Under the hood**: The importer parses raw rows, validates registration numbers (`sbd`) preserving leading zeros, filters invalid scores, maps header keys, and streams database writes in chunk batches of 5000 using transaction-backed bulk insertions (`createMany`) to ingest 1+ million scores in under 2 minutes.

---

## 🚀 Running the App Locally

Start both the API backend and Vite frontend concurrently in development mode:

```bash
npm run dev
```

- **Backend API**: Running at [http://localhost:3000](http://localhost:3000)
- **Frontend Dashboard**: Running at [http://localhost:5173](http://localhost:5173)

---

## 🐳 Docker Deployment (Orchestration)

Run the entire application stack in containerized production mode with a single command:

```bash
docker-compose up --build
```

This starts:

1.  `db`: PostgreSQL 15 database service with automated healthchecks.
2.  `api`: NestJS API container that runs database migrations and exposes port `3000`.
3.  `web`: Nginx-powered React container serving built static assets on port `80`.

---

## 🧪 Testing Suites

Run full unit and integration/E2E test suites for backend and frontend.

### Backend API Tests (`apps/api`)

Run NestJS unit tests:

```bash
npm run test -w apps/api
```

Run NestJS E2E integration tests (with mocked Prisma database connections):

```bash
npm run test:e2e -w apps/api
```

### Frontend UI Tests (`apps/web`)

Run React component tests (Vitest + React Testing Library):

```bash
npm run test -w apps/web
```

### Quality Gates (Linting & Compilation)

Verify code styles and TypeScript safety:

```bash
npm run lint && npm run typecheck
```

---

## 🔌 API Endpoints Reference

### 1. Score Lookup

- **Endpoint**: `GET /api/exam-results/:registrationNumber`
- **Description**: Find individual student scores by their registration number (SBD).
- **Success Response (200 OK)**:
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
        "biology": 5.0,
        "history": null,
        "geography": null,
        "civicEducation": null
      }
    }
  }
  ```

### 2. Score Distribution

- **Endpoint**: `GET /api/reports/score-distribution`
- **Description**: Aggregates exam scores for every subject into four standard performance bands.
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "subject": "math",
        "label": "Mathematics",
        "levels": {
          "GTE_8": 105820,
          "GTE_6_LT_8": 348210,
          "GTE_4_LT_6": 482103,
          "LT_4": 125474
        }
      }
    ]
  }
  ```

### 3. Group A Top Rankings

- **Endpoint**: `GET /api/rankings/group-a?limit=10`
- **Description**: Lists top-scoring Group A students (Math + Physics + Chemistry combined), resolving ties deterministically by registration number.
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "registrationNumber": "01000001",
        "totalScore": 29.5,
        "scores": {
          "math": 10.0,
          "physics": 9.75,
          "chemistry": 9.75
        }
      }
    ]
  }
  ```
