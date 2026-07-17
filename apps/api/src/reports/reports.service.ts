import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectRegistry } from '../subjects/subject-registry.service';

export interface ScoreDistributionSubjectReport {
  subject: string;
  label: string;
  levels: {
    GTE_8: number;
    GTE_6_LT_8: number;
    GTE_4_LT_6: number;
    LT_4: number;
  };
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: SubjectRegistry,
  ) {}

  async getScoreDistribution(): Promise<ScoreDistributionSubjectReport[]> {
    const subjects = this.registry.getAll();
    if (subjects.length === 0) {
      return [];
    }

    // Build the aggregation columns dynamically from registry database fields (trusted constant metadata)
    const selectFields: string[] = [];
    for (const subject of subjects) {
      // Map to snake_case column names mapping to SQL table
      // We map camelCase dbField to snake_case if mapping exists, but in our Prisma schema,
      // mapping is done. However, raw queries query the actual table columns in PostgreSQL.
      // Wait, does the raw query use PostgreSQL column names? Yes, table columns in PostgreSQL are snake_case:
      // registration_number, math, literature, foreign_language, physics, chemistry, biology, history, geography, civic_education, foreign_language_code
      // Let's get the exact SQL column name:
      let sqlColumn = subject.dbField;
      if (subject.dbField === 'foreignLanguage') {
        sqlColumn = 'foreign_language';
      } else if (subject.dbField === 'civicEducation') {
        sqlColumn = 'civic_education';
      } else if (subject.dbField === 'foreignLanguageCode') {
        sqlColumn = 'foreign_language_code';
      }

      const field = `"${sqlColumn}"`;
      selectFields.push(
        `COUNT(CASE WHEN ${field} >= 8.0 THEN 1 END) as "${subject.dbField}_GTE_8"`,
        `COUNT(CASE WHEN ${field} >= 6.0 AND ${field} < 8.0 THEN 1 END) as "${subject.dbField}_GTE_6_LT_8"`,
        `COUNT(CASE WHEN ${field} >= 4.0 AND ${field} < 6.0 THEN 1 END) as "${subject.dbField}_GTE_4_LT_6"`,
        `COUNT(CASE WHEN ${field} < 4.0 THEN 1 END) as "${subject.dbField}_LT_4"`,
      );
    }

    const queryStr = `SELECT ${selectFields.join(', ')} FROM "exam_results"`;

    // Execute raw query. There is no user input or variables, so it is safe from SQL injection.
    const resultList =
      await this.prisma.$queryRawUnsafe<Record<string, string | number>[]>(
        queryStr,
      );
    const result = resultList[0] || {};

    return subjects.map((subject) => {
      const dbField = subject.dbField;

      const getCount = (suffix: string): number => {
        const val = result[`${dbField}_${suffix}`];
        if (typeof val === 'number') return val;
        if (typeof val === 'bigint') return Number(val);
        if (typeof val === 'string') return parseInt(val, 10) || 0;
        return 0;
      };

      return {
        subject: subject.dbField,
        label: subject.displayName,
        levels: {
          GTE_8: getCount('GTE_8'),
          GTE_6_LT_8: getCount('GTE_6_LT_8'),
          GTE_4_LT_6: getCount('GTE_4_LT_6'),
          LT_4: getCount('LT_4'),
        },
      };
    });
  }
}
