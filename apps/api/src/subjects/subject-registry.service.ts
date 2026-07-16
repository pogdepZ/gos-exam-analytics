import { Injectable, BadRequestException } from '@nestjs/common';
import { SubjectDefinition } from './subject.definition';
import {
  MathSubject,
  LiteratureSubject,
  ForeignLanguageSubject,
  PhysicsSubject,
  ChemistrySubject,
  BiologySubject,
  HistorySubject,
  GeographySubject,
  CivicEducationSubject,
} from './concrete-subjects';

@Injectable()
export class SubjectRegistry {
  private readonly subjectsMap = new Map<string, SubjectDefinition>();

  constructor() {
    // Automatically register standard subjects
    this.register(new MathSubject());
    this.register(new LiteratureSubject());
    this.register(new ForeignLanguageSubject());
    this.register(new PhysicsSubject());
    this.register(new ChemistrySubject());
    this.register(new BiologySubject());
    this.register(new HistorySubject());
    this.register(new GeographySubject());
    this.register(new CivicEducationSubject());
  }

  register(subject: SubjectDefinition): void {
    const code = subject.code.toUpperCase();
    if (this.subjectsMap.has(code)) {
      throw new Error(`Subject with code ${code} is already registered.`);
    }
    this.subjectsMap.set(code, subject);
  }

  getAll(): SubjectDefinition[] {
    return Array.from(this.subjectsMap.values()).filter((s) => s.isEnabled);
  }

  getByCode(code: string): SubjectDefinition {
    const cleanCode = code.trim().toUpperCase();
    const subject = this.subjectsMap.get(cleanCode);
    if (!subject) {
      throw new BadRequestException(`Unknown subject code: ${code}`);
    }
    return subject;
  }

  getByDbField(dbField: string): SubjectDefinition {
    const cleanField = dbField.trim().toLowerCase();
    const subject = Array.from(this.subjectsMap.values()).find(
      (s) => s.dbField.toLowerCase() === cleanField,
    );
    if (!subject) {
      throw new BadRequestException(`Unknown database field: ${dbField}`);
    }
    return subject;
  }

  getGroupSubjects(groupName: string): SubjectDefinition[] {
    const cleanGroup = groupName.trim().toUpperCase();
    return this.getAll().filter((s) => s.examGroups.includes(cleanGroup));
  }
}
