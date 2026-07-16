---
name: backend-api
description: Guidelines for building NestJS REST APIs, validation using class-validator, Prisma query structures, OOP subject domains, and data aggregation schemas.
---

# Backend API Skill

## Purpose

This skill establishes standardized development practices for the NestJS API backend, emphasizing OOP subject domains, error handling, DTO validation, and optimal database query structures.

## Trigger Conditions

Use this skill when:

- Designing new NestJS modules, controllers, or services.
- Writing validation rules, decorators, or exception filters.
- Crafting queries for lookup, statistics/aggregation, or group ranking.
- Defining response envelopes or contract schemas.

## Required Workflow

1. **NestJS Architecture**: Separate logic into discrete modules (`ExamResultsModule`, `ReportsModule`, `RankingsModule`).
2. **DTO Validation**: Every incoming request payload (params, query, body) must be modeled using DTO classes decorated with `class-validator` properties. Validate globally in NestJS using a validation pipe.
3. **OOP Subject Domain**: Model subjects using a registry pattern. Avoid hardcoding subject names (like `'math'`, `'physics'`) directly in services. Use a `SubjectRegistry` that handles translations, metadata, database field mappings, and exam group eligibility.
4. **Lookup Endpoint**: Implement `GET /api/exam-results/:registrationNumber` with standardized error formatting (e.g. 404 when student not found).
5. **Aggregation / Statistics**: Implement `GET /api/reports/score-distribution`. Aggregate score ranges directly in PostgreSQL using database queries/aggregations rather than fetching all rows and aggregating in memory.
6. **Group A Ranking**: Implement `GET /api/rankings/group-a?limit=10`. Calculate top Group A students (Math + Physics + Chemistry) using database queries. Sort and tie-break deterministically.
7. **Error Responses**: Return standardized error response envelopes to the frontend:
   - Success format: `{ "data": ... }`
   - Error format: `{ "error": { "code": "SOME_ERROR_CODE", "message": "Readable description" } }`

## Non-Negotiable Rules

- **No Direct DB Calls in Controller**: Controllers must call services, services must query databases via Prisma.
- **DTO Safety**: Always enable `whitelist: true` and `forbidNonWhitelisted: true` on `ValidationPipe` to filter out unsolicited request fields.
- **Sanitize Error Stack**: Never return database exceptions or raw error stack traces to the frontend. Catch all unexpected exceptions and return a standard `500 Internal Server Error`.
- **Subject OOP Registry**: Any subject-specific calculations (like score ranges or group requirements) must consult the `SubjectRegistry` instead of hardcoding conditions.

## Expected Outputs

- Formatted NestJS modules, controllers, and services.
- Data Transfer Objects (DTOs) with validation rules.
- Object-Oriented Subject classes and registry.
- Standardized error and response formats.

## Acceptance Checklist

- [ ] DTO validations cover all route parameters and query strings.
- [ ] Unknown registration numbers return a clear, contract-compliant 404 response.
- [ ] Score distribution calculations use database-level aggregation.
- [ ] Subject mapping and metadata are centralized in a registry class structure.
- [ ] Error messages do not leak database exceptions or stack traces.

## Relevant Examples

### OOP Subject Registry Design Example

```typescript
export interface Subject {
  code: string;
  name: string;
  dbField: string;
  isGroupA: boolean;
}

@Injectable()
export class SubjectRegistry {
  private readonly subjects = new Map<string, Subject>();

  constructor() {
    this.register({
      code: "MATH",
      name: "Mathematics",
      dbField: "math",
      isGroupA: true,
    });
    this.register({
      code: "PHYS",
      name: "Physics",
      dbField: "physics",
      isGroupA: true,
    });
    this.register({
      code: "CHEM",
      name: "Chemistry",
      dbField: "chemistry",
      isGroupA: true,
    });
    // Register remaining subjects...
  }

  private register(subject: Subject) {
    this.subjects.set(subject.code, subject);
  }

  getSubjects(): Subject[] {
    return Array.from(this.subjects.values());
  }

  getGroupASubjects(): Subject[] {
    return this.getSubjects().filter((s) => s.isGroupA);
  }
}
```
