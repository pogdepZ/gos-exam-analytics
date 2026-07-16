---
name: exam-data-import
description: Rules and strategies for importing, parsing, validating, and seeding high school exam data from CSV format into PostgreSQL database.
---

# Exam Data Import Skill

## Purpose

This skill ensures reliable, idempotent, and highly performant CSV ingestion into the PostgreSQL database, handling data validation, malformed rows, batching, and error reporting.

## Trigger Conditions

Use this skill when:

- Creating database schemas or migrations containing subject fields.
- Writing the CSV parsing and import scripts.
- Modifying import performance or batch configurations.
- Resolving data consistency, duplicate registration numbers, or seeding errors.

## Required Workflow

1. **Header Verification**: Inspect CSV header format (e.g. `sbd`, `toan`, `ngu_van`, etc.) and map to target schema attributes.
2. **Parsing Stream**: Read the CSV file via a stream to avoid loading the entire 42MB file into memory at once.
3. **Data Normalization**:
   - Keep registration numbers (`sbd`) as strings to preserve leading zeros.
   - Parse score fields as numbers (0.0 to 10.0) or `null` if empty.
4. **Validation Filter**: Validate score ranges. Discard or report rows that violate rules (e.g., registration number format, scores < 0 or > 10).
5. **Batch Ingestion**: Bulk-insert rows in chunks (e.g., 5,000 or 10,000 rows) using transactional SQL commands or Prisma's `createMany` with duplicate conflict handling.
6. **Idempotence**: Handle duplicates using upserts or `onConflict` ignore, ensuring rerun of the import script doesn't result in duplicate entries or database errors.
7. **Performance & Statistics**: Log an execution summary (total rows, inserted, skipped, invalid, duplicates, elapsed time).

## Non-Negotiable Rules

- **No Floating Point Issues**: Scores should be validated and stored cleanly. Use exact ranges.
- **Preserve Leading Zeros**: Registration numbers must remain strings. Do not cast them to integers.
- **Null Handling**: Missing scores must be stored as `NULL` (or JS `null`), never as `0` or `""`.
- **Database Constraints**: Define unique constraints on `registrationNumber` in the DB.
- **Batching**: Always batch inserts to prevent database connection timeouts and out-of-memory crashes.

## Expected Outputs

- Node.js/NestJS script or command (e.g. `npm run data:import`) that runs the import pipeline.
- Validation checks on the inputs.
- An execution summary outputted to console.

## Acceptance Checklist

- [ ] Import script reads from the CSV file correctly without high memory consumption.
- [ ] All subjects map to their database counterparts.
- [ ] Invalid rows are logged and not inserted.
- [ ] Duplicate registration numbers are handled gracefully (idempotency).
- [ ] The command runs to completion and logs a detailed statistics summary.

## Relevant Examples

### CSV Ingestion Mapping Example

```typescript
interface RawCsvRow {
  sbd: string;
  toan?: string;
  ngu_van?: string;
  vat_li?: string;
  hoa_hoc?: string;
  sinh_hoc?: string;
  ma_ngoai_ngu?: string;
  // Other subjects...
}

function parseScore(val?: string): number | null {
  if (!val || val.trim() === "") return null;
  const parsed = parseFloat(val);
  if (isNaN(parsed) || parsed < 0 || parsed > 10) {
    throw new Error(`Invalid score value: ${val}`);
  }
  return parsed;
}
```
