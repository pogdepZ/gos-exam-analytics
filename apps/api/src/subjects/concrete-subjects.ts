import { SubjectDefinition } from './subject.definition';

export class MathSubject extends SubjectDefinition {
  readonly code = 'MATH';
  readonly displayName = 'Mathematics';
  readonly csvColumn = 'toan';
  readonly dbField = 'math';
  readonly isEnabled = true;
  readonly examGroups = ['A', 'A1', 'B', 'D'];
}

export class LiteratureSubject extends SubjectDefinition {
  readonly code = 'LIT';
  readonly displayName = 'Literature';
  readonly csvColumn = 'ngu_van';
  readonly dbField = 'literature';
  readonly isEnabled = true;
  readonly examGroups = ['C', 'D'];
}

export class ForeignLanguageSubject extends SubjectDefinition {
  readonly code = 'LANG';
  readonly displayName = 'Foreign Language';
  readonly csvColumn = 'ngoai_ngu';
  readonly dbField = 'foreignLanguage';
  readonly isEnabled = true;
  readonly examGroups = ['A1', 'D'];
}

export class PhysicsSubject extends SubjectDefinition {
  readonly code = 'PHYS';
  readonly displayName = 'Physics';
  readonly csvColumn = 'vat_li';
  readonly dbField = 'physics';
  readonly isEnabled = true;
  readonly examGroups = ['A', 'A1'];
}

export class ChemistrySubject extends SubjectDefinition {
  readonly code = 'CHEM';
  readonly displayName = 'Chemistry';
  readonly csvColumn = 'hoa_hoc';
  readonly dbField = 'chemistry';
  readonly isEnabled = true;
  readonly examGroups = ['A', 'B'];
}

export class BiologySubject extends SubjectDefinition {
  readonly code = 'BIO';
  readonly displayName = 'Biology';
  readonly csvColumn = 'sinh_hoc';
  readonly dbField = 'biology';
  readonly isEnabled = true;
  readonly examGroups = ['B'];
}

export class HistorySubject extends SubjectDefinition {
  readonly code = 'HIST';
  readonly displayName = 'History';
  readonly csvColumn = 'lich_su';
  readonly dbField = 'history';
  readonly isEnabled = true;
  readonly examGroups = ['C'];
}

export class GeographySubject extends SubjectDefinition {
  readonly code = 'GEOG';
  readonly displayName = 'Geography';
  readonly csvColumn = 'dia_li';
  readonly dbField = 'geography';
  readonly isEnabled = true;
  readonly examGroups = ['C'];
}

export class CivicEducationSubject extends SubjectDefinition {
  readonly code = 'CIVIC';
  readonly displayName = 'Civic Education';
  readonly csvColumn = 'gdcd';
  readonly dbField = 'civicEducation';
  readonly isEnabled = true;
  readonly examGroups = [];
}
