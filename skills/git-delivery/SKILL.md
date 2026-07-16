---
name: git-delivery
description: Guidelines for committing changes, maintaining a clean Git history using conventional commits, pre-commit validation gates, and packaging deliverables.
---

# Git Delivery Skill

## Purpose
This skill ensures a transparent, traceable, and production-quality Git history. It enforces pre-commit verification gates, prevents half-finished features from reaching the main branch, and outlines release packaging guidelines.

## Trigger Conditions
Use this skill when:
- Creating commits or planning development milestones.
- Preparing code changes for linting, testing, and building.
- Verifying the final deliverables and packaging the project.

## Required Workflow
1. **Conventional Commits**: Use prefix keywords to describe change intent:
   - `feat(...)`: A new user-facing feature.
   - `fix(...)`: A bug fix.
   - `docs(...)`: Documentation changes only.
   - `style(...)`: Formatting, design polish, visual-only updates.
   - `refactor(...)`: Restructuring code without changing behavior.
   - `test(...)`: Adding missing tests or correcting existing tests.
   - `chore(...)`: General workspace config, package updates, build scripts.
2. **One Feature per Commit**: Avoid combining unrelated features. Each commit must contain a single logical, fully tested step.
3. **Pre-Commit Verification Gates**: Prior to executing any commit, run:
   - `npm run lint` (Linting check)
   - `npm run typecheck` (TypeScript validation)
   - `npm run test` (All tests must pass)
   - `npm run build` (Build verification)
4. **No Broken History**: Do not use `git commit --amend`, `git rebase`, or force push on shared branches. Keep the commit history sequential and clear.

## Non-Negotiable Rules
- **No Failing Commits**: Never commit code that fails testing, typechecking, or linting.
- **Strict Naming**: Stick to the required commit messages exactly when specified by the assignment guidelines (e.g. `chore(skills): add implementation workflow skills`).
- **No Secrets**: Never commit `.env` configuration files or plain secrets to repository control.

## Expected Outputs
- A clean, logical, linear Git log.
- All code passing strict pre-commit verification.
- A descriptive README detailing step-by-step setup and local verification procedures.

## Acceptance Checklist
- [ ] Commits match the conventional commits format.
- [ ] Each feature is implemented in its own, single commit.
- [ ] No force pushes or history rewriting commands were used.
- [ ] The README file lists correct commands matching the codebase structure.

## Relevant Examples

### Correct Commit Flow Example
1. Commit 1: `chore(skills): add implementation workflow skills`
2. Commit 2: `chore: initialize full-stack project`
3. Commit 3: `feat(database): add prisma schema and postgres configuration`
4. Commit 4: `feat(import): add csv exam result importer`
5. ...and so on, matching the specified sequence.
