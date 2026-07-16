---
name: project-architecture
description: Rules and guidelines for the monorepo structure, dependency boundaries, architectural layers (NestJS/React), coding standards, and Definition of Done.
---

# Project Architecture Skill

## Purpose
This skill establishes a clean, maintainable, and type-safe monorepo project structure for both frontend (React + Vite + TypeScript) and backend (NestJS + TypeScript) applications. It defines boundary rules between layers, naming conventions, and the Definition of Done.

## Trigger Conditions
Use this skill when:
- Initializing or structuring the project.
- Creating new applications, packages, modules, controllers, services, repositories, components, or hooks.
- Configuring environment variables or build pipelines.
- Verifying architectural integrity before code reviews or commits.

## Required Workflow
1. **Workspace Configuration**: Maintain an npm/pnpm workspace layout with `apps/web` (frontend) and `apps/api` (backend).
2. **Layer Separation**: Keep controllers, services, database access (Prisma), and domain models distinct.
3. **Data Flows**: Ensure external requests flow through Controllers -> Services -> Repositories/Prisma -> Database.
4. **Environment Variables**: Define all external configurations in a `.env` file at the root, mapping them to local configurations via validation schemas. Ensure a `.env.example` is kept up to date.
5. **Code Review & Quality Check**: Apply ESLint, Prettier, TypeScript typechecking, and tests before completing any architectural changes.

## Non-Negotiable Rules
- **No Shared Untrusted State**: Do not leak raw Prisma entities or database details directly to the frontend. Use DTOs and API responses containing structured contracts.
- **Layer Boundaries**: Controllers must not query the database directly. They must delegate to Services.
- **No Circular Dependencies**: Check for and resolve circular imports between NestJS modules or React components immediately.
- **Strict TypeScript**: Run compiler with strict mode (`strict: true`). No implicit `any` is allowed.
- **Code Cleanliness**: No commented-out code, debug logs (except standard logging), or unused variables in production-ready files.

## Expected Outputs
- `package.json` at root defining workspaces.
- NestJS applications grouped by domain modules (`src/exam-results`, `src/reports`, etc.).
- React application structured with custom hooks, components, routes, and API clients using React Query.
- Unified environment variable loading and validation.

## Acceptance Checklist
- [ ] Root `package.json` configures workspaces for `apps/web` and `apps/api`.
- [ ] Backend modules maintain NestJS layer separations (Controller, Service, Module, DTO, Domain).
- [ ] Frontend code is modular and utilizes custom React hooks for API fetching and state management.
- [ ] Strict mode is enabled in TypeScript configurations.
- [ ] Linting, typechecking, and tests pass for both applications.

## Relevant Examples

### Backend Controller Example (Thin Controller)
```typescript
@Controller('exam-results')
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  @Get(':registrationNumber')
  async getByRegistrationNumber(
    @Param('registrationNumber') regNum: string
  ): Promise<ExamResultResponseDto> {
    const result = await this.examResultsService.findOne(regNum);
    return { data: result };
  }
}
```

### Backend Service Example
```typescript
@Injectable()
export class ExamResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(registrationNumber: string): Promise<ExamResultDomain> {
    const record = await this.prisma.examResult.findUnique({
      where: { registrationNumber },
    });
    if (!record) {
      throw new NotFoundException('Exam result not found');
    }
    return ExamResultDomain.fromDb(record);
  }
}

<!-- Validated implementation workflow -->

```
