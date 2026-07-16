import { parseCsvLine, validateHeaders, ProcessedRow } from './csv-parser.util';

describe('csv-parser.util', () => {
  const standardHeaders = [
    'sbd',
    'toan',
    'ngu_van',
    'ngoai_ngu',
    'vat_li',
    'hoa_hoc',
    'sinh_hoc',
    'lich_su',
    'dia_li',
    'gdcd',
    'ma_ngoai_ngu',
  ];

  describe('validateHeaders', () => {
    it('should pass on valid headers containing sbd', () => {
      expect(() => validateHeaders(standardHeaders)).not.toThrow();
    });

    it('should throw an error if sbd is missing', () => {
      expect(() => validateHeaders(['toan', 'ngu_van'])).toThrow(
        /missing required column 'sbd'/,
      );
    });
  });

  describe('parseCsvLine', () => {
    it('should successfully parse a valid row', () => {
      const line = '01000001,8.4,6.75,8.0,6.0,5.25,5.0,,,,N1';
      const result = parseCsvLine(line, standardHeaders);

      expect(result).toEqual<ProcessedRow>({
        registrationNumber: '01000001',
        math: 8.4,
        literature: 6.75,
        foreignLanguage: 8.0,
        physics: 6.0,
        chemistry: 5.25,
        biology: 5.0,
        history: null,
        geography: null,
        civicEducation: null,
        foreignLanguageCode: 'N1',
      });
    });

    it('should preserve leading zeros and pad registration numbers to 8 characters', () => {
      const line = '12345,8.4,6.75,,,,,,,,,';
      const result = parseCsvLine(line, standardHeaders);
      expect(result.registrationNumber).toBe('00012345');
    });

    it('should store missing scores as null', () => {
      const line = '01000001,,6.75,,,,,,,,,';
      const result = parseCsvLine(line, standardHeaders);
      expect(result.math).toBeNull();
      expect(result.literature).toBe(6.75);
    });

    it('should reject non-numeric registration numbers', () => {
      const line = '0100000A,8.4,6.75,,,,,,,,,';
      expect(() => parseCsvLine(line, standardHeaders)).toThrow(
        /Invalid registration number format/,
      );
    });

    it('should reject invalid numeric scores', () => {
      const line = '01000001,abc,6.75,,,,,,,,,';
      expect(() => parseCsvLine(line, standardHeaders)).toThrow(
        /Invalid numeric score for toan/,
      );
    });

    it('should reject scores outside 0-10 range', () => {
      const line = '01000001,11,6.75,,,,,,,,,';
      expect(() => parseCsvLine(line, standardHeaders)).toThrow(
        /Score for toan out of range/,
      );

      const negativeLine = '01000001,-1,6.75,,,,,,,,,';
      expect(() => parseCsvLine(negativeLine, standardHeaders)).toThrow(
        /Score for toan out of range/,
      );
    });

    it('should handle malformed rows and extra fields gracefully', () => {
      const line = '01000001,8.4,,,,,,,,,,extra1,extra2';
      const result = parseCsvLine(line, standardHeaders);
      expect(result.registrationNumber).toBe('01000001');
      expect(result.math).toBe(8.4);
    });
  });
});
