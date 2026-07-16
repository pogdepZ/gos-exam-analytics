export interface RawReportSubject {
  subject: string;
  label: string;
  levels: {
    GTE_8: number;
    GTE_6_LT_8: number;
    GTE_4_LT_6: number;
    LT_4: number;
  };
}

export interface ChartDataPoint {
  range: string;
  count: number;
}

export function transformSubjectData(
  subjectData: RawReportSubject,
): ChartDataPoint[] {
  return [
    { range: "score >= 8", count: subjectData.levels.GTE_8 },
    { range: "6 <= score < 8", count: subjectData.levels.GTE_6_LT_8 },
    { range: "4 <= score < 6", count: subjectData.levels.GTE_4_LT_6 },
    { range: "score < 4", count: subjectData.levels.LT_4 },
  ];
}
