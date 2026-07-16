export interface ProcessedRow {
  registrationNumber: string;
  math: number | null;
  literature: number | null;
  foreignLanguage: number | null;
  physics: number | null;
  chemistry: number | null;
  biology: number | null;
  history: number | null;
  geography: number | null;
  civicEducation: number | null;
  foreignLanguageCode: string | null;
}

export function validateHeaders(headers: string[]): void {
  const required = 'sbd';
  const cleanHeaders = headers.map((h) => h.trim().toLowerCase());
  if (!cleanHeaders.includes(required)) {
    throw new Error(
      `Invalid CSV header: missing required column '${required}'`,
    );
  }
}

export function parseCsvLine(line: string, headers: string[]): ProcessedRow {
  const parts = line.split(',').map((p) => p.trim());
  const cleanHeaders = headers.map((h) => h.trim().toLowerCase());

  // Construct a record from headers and parts
  const row: Record<string, string> = {};
  for (let i = 0; i < cleanHeaders.length; i++) {
    row[cleanHeaders[i]] = parts[i] || '';
  }

  const rawSbd = row['sbd'];
  if (!rawSbd) {
    throw new Error('Missing registration number (sbd)');
  }

  if (!/^\d+$/.test(rawSbd)) {
    throw new Error(`Invalid registration number format: ${rawSbd}`);
  }

  const registrationNumber = rawSbd.padStart(8, '0');

  const parseScore = (field: string): number | null => {
    const value = row[field];
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const score = parseFloat(value);
    if (isNaN(score)) {
      throw new Error(`Invalid numeric score for ${field}: ${value}`);
    }
    if (score < 0 || score > 10) {
      throw new Error(`Score for ${field} out of range (0-10): ${score}`);
    }
    return score;
  };

  return {
    registrationNumber,
    math: parseScore('toan'),
    literature: parseScore('ngu_van'),
    foreignLanguage: parseScore('ngoai_ngu'),
    physics: parseScore('vat_li'),
    chemistry: parseScore('hoa_hoc'),
    biology: parseScore('sinh_hoc'),
    history: parseScore('lich_su'),
    geography: parseScore('dia_li'),
    civicEducation: parseScore('gdcd'),
    foreignLanguageCode: row['ma_ngoai_ngu'] || null,
  };
}
