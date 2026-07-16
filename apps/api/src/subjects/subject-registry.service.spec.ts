import { SubjectRegistry } from './subject-registry.service';
import { SubjectDefinition } from './subject.definition';
import { BadRequestException } from '@nestjs/common';

class CustomTestSubject extends SubjectDefinition {
  readonly code = 'TEST';
  readonly displayName = 'Test Subject';
  readonly csvColumn = 'test_col';
  readonly dbField = 'testField';
  readonly isEnabled = true;
  readonly examGroups = ['A', 'TEST_GROUP'];
}

class DuplicateTestSubject extends SubjectDefinition {
  readonly code = 'MATH'; // Duplicate code of standard MathSubject
  readonly displayName = 'Math Duplicate';
  readonly csvColumn = 'math_dup';
  readonly dbField = 'mathDup';
  readonly isEnabled = true;
  readonly examGroups = [];
}

describe('SubjectRegistry', () => {
  let registry: SubjectRegistry;

  beforeEach(() => {
    registry = new SubjectRegistry();
  });

  describe('Initialization and Lookup', () => {
    it('should automatically register all standard subjects', () => {
      const all = registry.getAll();
      expect(all.length).toBe(9);
      expect(all.some((s) => s.code === 'MATH')).toBe(true);
      expect(all.some((s) => s.code === 'PHYS')).toBe(true);
      expect(all.some((s) => s.code === 'CHEM')).toBe(true);
    });

    it('should successfully lookup subjects by code', () => {
      const math = registry.getByCode('MATH');
      expect(math.displayName).toBe('Mathematics');
      expect(math.dbField).toBe('math');

      // Case insensitive
      const phys = registry.getByCode('phys');
      expect(phys.displayName).toBe('Physics');
    });

    it('should successfully lookup subjects by database field', () => {
      const lit = registry.getByDbField('literature');
      expect(lit.code).toBe('LIT');

      // Case insensitive
      const lang = registry.getByDbField('foreignLanguage');
      expect(lang.code).toBe('LANG');
    });

    it('should throw BadRequestException for unknown subject codes', () => {
      expect(() => registry.getByCode('UNKNOWN')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unknown database fields', () => {
      expect(() => registry.getByDbField('unknownField')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('Subject Registration', () => {
    it('should allow registering new unique subjects', () => {
      const custom = new CustomTestSubject();
      expect(() => registry.register(custom)).not.toThrow();
      expect(registry.getByCode('TEST')).toBe(custom);
    });

    it('should throw an error when registering duplicate subject codes', () => {
      const duplicate = new DuplicateTestSubject();
      expect(() => registry.register(duplicate)).toThrow(
        /is already registered/,
      );
    });
  });

  describe('Exam Group Resolution', () => {
    it('should resolve Group A subjects (Mathematics, Physics, Chemistry)', () => {
      const groupASubjects = registry.getGroupSubjects('A');
      const codes = groupASubjects.map((s) => s.code);

      expect(codes).toContain('MATH');
      expect(codes).toContain('PHYS');
      expect(codes).toContain('CHEM');
      expect(codes.length).toBe(3);
    });

    it('should return empty list for unknown or empty exam groups', () => {
      const emptyGroup = registry.getGroupSubjects('XYZ');
      expect(emptyGroup.length).toBe(0);
    });
  });
});
