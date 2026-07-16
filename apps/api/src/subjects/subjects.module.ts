import { Module } from '@nestjs/common';
import { SubjectRegistry } from './subject-registry.service';

@Module({
  providers: [SubjectRegistry],
  exports: [SubjectRegistry],
})
export class SubjectsModule {}
