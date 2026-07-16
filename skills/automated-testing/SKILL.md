---
name: automated-testing
description: Strategy and guidelines for writing Jest, Supertest, Vitest, and React Testing Library tests, configuring mocks, covering edge cases, and running coverage checks.
---

# Automated Testing Skill

## Purpose

This skill ensures code reliability, regression prevention, and strict quality control by establishing guidelines for writing unit and integration tests across both the frontend and backend.

## Trigger Conditions

Use this skill when:

- Writing new unit tests (Vitest/Jest).
- Creating API integration tests (Supertest).
- Adding frontend component tests (React Testing Library).
- Designing mocks for Prisma, network requests, or third-party packages.
- Reviewing test coverage before committing.

## Required Workflow

1. **Writing Unit Tests**: Focus on business logic (CSV import, subject registry, calculations). Test edge cases, boundary conditions, and exceptional execution paths.
2. **Writing Integration Tests**: Verify HTTP status codes, validation filters, DTO schema compliance, database integration, and error envelopes.
3. **Writing Frontend Tests**: Test component rendering, form validation failures, loading/error states, user input interaction, and routing.
4. **Mocking Strategies**:
   - In backend unit tests, mock the database layer (`PrismaService` or Prisma client).
   - In frontend tests, mock API network calls using MSW (Mock Service Worker) or spy-based fetch overrides. Avoid testing implementation details; test user-visible behavior.
5. **Check Coverage**: Maintain high coverage for key domain and service logic (target: >= 80% line coverage for business layers).

## Non-Negotiable Rules

- **No Skipping Tests**: Do not skip or disable tests to force a build to pass.
- **Isolate Database Tests**: When testing queries directly, ensure the database is cleaned up or transactions are rolled back.
- **Predictable Assertions**: Avoid flaky assertions (e.g. testing timing or dates without fixed mock values).
- **Correct Naming**: Filenames must end in `.spec.ts`, `.test.ts`, `.spec.tsx`, or `.test.tsx`.

## Expected Outputs

- Jest unit and integration tests under `apps/api/test` or near source files.
- Vitest unit and component tests under `apps/web/src` near component folders.
- Clean test scripts (`npm run test`, `npm run test:cov`, `npm run test:e2e`).

## Acceptance Checklist

- [ ] Backend tests cover valid, boundary, and invalid CSV parsing edge cases.
- [ ] Integration tests verify Supertest queries against api controllers (lookup, rankings, reports).
- [ ] Frontend tests verify form interaction, error messaging, and charts fallback.
- [ ] Total line coverage on core business logic meets or exceeds 80%.
- [ ] All tests execute successfully before any code is committed.

## Relevant Examples

### Backend Controller Integration Test Example

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("ExamResultsController (Integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/exam-results/:registrationNumber should return 200 on success", () => {
    return request(app.getHttpServer())
      .get("/api/exam-results/01000001")
      .expect(200)
      .expect((res) => {
        expect(res.body.data.registrationNumber).toBe("01000001");
      });
  });

  it("GET /api/exam-results/:registrationNumber should return 404 if not found", () => {
    return request(app.getHttpServer())
      .get("/api/exam-results/99999999")
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe("EXAM_RESULT_NOT_FOUND");
      });
  });
});
```
