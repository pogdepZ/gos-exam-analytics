import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GroupARanking {
  registrationNumber: string;
  totalScore: number;
  scores: {
    math: number;
    physics: number;
    chemistry: number;
  };
}

interface RawGroupAResult {
  registrationNumber: string;
  math: number;
  physics: number;
  chemistry: number;
  totalScore: number;
}

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupARankings(limit = 10): Promise<GroupARanking[]> {
    const limitVal = Math.max(1, Math.min(100, limit));

    // Calculate ranking using parameterized SQL query
    const results = await this.prisma.$queryRaw<RawGroupAResult[]>`
      SELECT
        "registration_number" as "registrationNumber",
        "math",
        "physics",
        "chemistry",
        ("math" + "physics" + "chemistry") as "totalScore"
      FROM "exam_results"
      WHERE "math" IS NOT NULL AND "physics" IS NOT NULL AND "chemistry" IS NOT NULL
      ORDER BY ("math" + "physics" + "chemistry") DESC, "registration_number" ASC
      LIMIT ${limitVal}
    `;

    return results.map((r) => ({
      registrationNumber: r.registrationNumber,
      totalScore: Number(r.totalScore),
      scores: {
        math: Number(r.math),
        physics: Number(r.physics),
        chemistry: Number(r.chemistry),
      },
    }));
  }
}
