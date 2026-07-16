import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectRegistry } from '../subjects/subject-registry.service';

@Injectable()
export class ExamResultsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: SubjectRegistry,
  ) {}

  async findByRegistrationNumber(registrationNumber: string) {
    const paddedReg = registrationNumber.padStart(8, '0');

    const record = await this.prisma.examResult.findUnique({
      where: { registrationNumber: paddedReg },
    });

    if (!record) {
      throw new NotFoundException({
        code: 'EXAM_RESULT_NOT_FOUND',
        message: 'No exam result was found for this registration number',
      });
    }

    // Map database fields to the scores object dynamically using the SubjectRegistry
    const scores: Record<string, number | null> = {};
    const subjects = this.registry.getAll();
    const recordFields = record as unknown as Record<
      string,
      number | string | null | Date
    >;
    for (const subject of subjects) {
      const score = recordFields[subject.dbField];
      scores[subject.dbField] = typeof score === 'number' ? score : null;
    }

    return {
      registrationNumber: record.registrationNumber,
      scores,
    };
  }
}
