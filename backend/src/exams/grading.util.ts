export interface GradingScaleRow {
  minScore: number | { toNumber(): number };
  maxScore: number | { toNumber(): number };
  grade: string;
  gradePoint?: number | { toNumber(): number } | null;
  remark?: string | null;
  classOfResult?: string | null;
}

function asNumber(value: number | { toNumber(): number } | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  return typeof value === 'number' ? value : value.toNumber();
}

/**
 * Single source of truth for "which grading-scale row does this score fall
 * into". Previously reimplemented independently in ExamsService,
 * ResultComputationService, and TahfeezService with subtly different
 * Decimal-vs-number handling — any drift between the three risked a score
 * grading differently depending on which code path computed it.
 */
export function findGradeMatch<T extends GradingScaleRow>(
  score: number,
  scale: T[],
): T | undefined {
  return scale.find(
    (row) => score >= asNumber(row.minScore) && score <= asNumber(row.maxScore),
  );
}
