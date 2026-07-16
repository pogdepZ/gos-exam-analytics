export class ExamValidationUtil {
  static isValidRegistrationNumber(regNum: string): boolean {
    if (!regNum) return false;
    // Registration numbers in Vietnam THPT are strings of digits, typically 8 characters.
    // We allow 6 to 12 digits to be safe and robust.
    return /^\d{6,12}$/.test(regNum);
  }

  static isValidScore(score: number | null | undefined): boolean {
    if (score === null || score === undefined) return true;
    return (
      typeof score === 'number' && !isNaN(score) && score >= 0 && score <= 10
    );
  }
}
