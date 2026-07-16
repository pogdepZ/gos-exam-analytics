import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseCsvLine, validateHeaders } from '../import/csv-parser.util';

const BATCH_SIZE = 5000;

export async function runImporter() {
  const csvPath = path.resolve(process.cwd(), 'data/diem_thi_thpt_2024.csv');
  console.log(`Starting import from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const startTime = Date.now();

  let totalRows = 0;
  let insertedRows = 0;
  let invalidRows = 0;
  let duplicateRows = 0;

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let batch: any[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (headers.length === 0) {
      headers = line.split(',').map((h) => h.trim());
      try {
        validateHeaders(headers);
      } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
      continue;
    }

    totalRows++;

    try {
      const parsedRow = parseCsvLine(line, headers);
      batch.push(parsedRow);
    } catch {
      invalidRows++;
      continue;
    }

    if (batch.length >= BATCH_SIZE) {
      const { inserted, duplicates } = await insertBatch(prisma, batch);
      insertedRows += inserted;
      duplicateRows += duplicates;
      batch = [];
      console.log(
        `Processed ${totalRows} rows... (Inserted: ${insertedRows}, Duplicates: ${duplicateRows}, Invalid: ${invalidRows})`,
      );
    }
  }

  // Insert remaining rows
  if (batch.length > 0) {
    const { inserted, duplicates } = await insertBatch(prisma, batch);
    insertedRows += inserted;
    duplicateRows += duplicates;
  }

  const executionTime = Date.now() - startTime;

  console.log('\n======================================');
  console.log('IMPORT SUMMARY:');
  console.log(`Total rows processed: ${totalRows}`);
  console.log(`Inserted rows:        ${insertedRows}`);
  console.log(`Duplicate rows:       ${duplicateRows}`);
  console.log(`Invalid/skipped rows: ${invalidRows}`);
  console.log(`Execution time:       ${(executionTime / 1000).toFixed(2)}s`);
  console.log('======================================\n');

  await prisma.$disconnect();

  return {
    totalRows,
    insertedRows,
    duplicateRows,
    invalidRows,
    executionTime,
  };
}

async function insertBatch(
  prisma: PrismaClient,
  batch: any[],
): Promise<{ inserted: number; duplicates: number }> {
  try {
    const result = await prisma.examResult.createMany({
      data: batch,
      skipDuplicates: true,
    });
    const inserted = result.count;
    const duplicates = batch.length - inserted;
    return { inserted, duplicates };
  } catch (err) {
    console.error('Failed to insert batch:', err);
    return { inserted: 0, duplicates: batch.length };
  }
}

// Run the script
if (process.env.NODE_ENV !== 'test') {
  runImporter().catch((err) => {
    console.error('Fatal import error:', err);
    process.exit(1);
  });
}
