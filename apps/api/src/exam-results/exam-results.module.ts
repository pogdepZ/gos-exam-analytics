import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { ExamResultsController } from './exam-results.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [PrismaModule, SubjectsModule],
  controllers: [ExamResultsController],
  providers: [ExamResultsService],
  exports: [ExamResultsService],
})
export class ExamResultsModule {}
