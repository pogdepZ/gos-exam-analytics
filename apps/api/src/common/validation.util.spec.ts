import { ExamValidationUtil } from './validation.util';

describe('ExamValidationUtil', () => {
  describe('isValidRegistrationNumber', () => {
    it('should validate correct registration numbers', () => {
      expect(ExamValidationUtil.isValidRegistrationNumber('01000001')).toBe(
        true,
      );
      expect(ExamValidationUtil.isValidRegistrationNumber('12345678')).toBe(
        true,
      );
      expect(ExamValidationUtil.isValidRegistrationNumber('123456')).toBe(true);
    });

    it('should reject non-numeric registration numbers', () => {
      expect(ExamValidationUtil.isValidRegistrationNumber('0100000A')).toBe(
        false,
      );
      expect(ExamValidationUtil.isValidRegistrationNumber('abc')).toBe(false);
    });

    it('should reject short or long registration numbers', () => {
      expect(ExamValidationUtil.isValidRegistrationNumber('12345')).toBe(false);
      expect(
        ExamValidationUtil.isValidRegistrationNumber('1234567890123'),
      ).toBe(false);
    });

    it('should reject empty or null inputs', () => {
      expect(ExamValidationUtil.isValidRegistrationNumber('')).toBe(false);
    });
  });

  describe('isValidScore', () => {
    it('should allow valid scores between 0 and 10', () => {
      expect(ExamValidationUtil.isValidScore(0)).toBe(true);
      expect(ExamValidationUtil.isValidScore(5.5)).toBe(true);
      expect(ExamValidationUtil.isValidScore(10)).toBe(true);
    });

    it('should allow null or undefined scores', () => {
      expect(ExamValidationUtil.isValidScore(null)).toBe(true);
      expect(ExamValidationUtil.isValidScore(undefined)).toBe(true);
    });

    it('should reject scores outside 0 to 10', () => {
      expect(ExamValidationUtil.isValidScore(-0.5)).toBe(false);
      expect(ExamValidationUtil.isValidScore(10.1)).toBe(false);
      expect(ExamValidationUtil.isValidScore(99)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(ExamValidationUtil.isValidScore(NaN)).toBe(false);
    });
  });
});
