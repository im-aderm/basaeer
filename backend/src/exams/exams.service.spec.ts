import { BadRequestException } from '@nestjs/common';
import { ExamsService } from './exams.service';

describe('ExamsService grading engine', () => {
  let service: ExamsService;

  beforeEach(() => {
    service = new ExamsService({} as any, {} as any, {} as any, {} as any, {} as any);
  });

  it('requires a branch grading scale before result computation', () => {
    expect(() =>
      (service as any).assertCompleteGradingScale([], 'branch-1'),
    ).toThrow(BadRequestException);
  });

  it('resolves grades, remarks, grade points, and result class from configured scale data', () => {
    const scale = [
      {
        minScore: 75,
        maxScore: 100,
        grade: 'A1',
        gradePoint: 5,
        remark: 'Excellent',
        classOfResult: 'DISTINCTION',
      },
      {
        minScore: 50,
        maxScore: 74.99,
        grade: 'C6',
        gradePoint: 2.5,
        remark: 'Credit',
        classOfResult: 'CREDIT',
      },
      {
        minScore: 0,
        maxScore: 49.99,
        grade: 'F9',
        gradePoint: 0,
        remark: 'Fail',
        classOfResult: 'FAIL',
      },
    ];

    expect((service as any).calculateGradeFromScale(77, scale)).toEqual({
      grade: 'A1',
      remark: 'Excellent',
      gradePoint: 5,
      classOfResult: 'DISTINCTION',
    });
  });

  it('falls back to an Ungraded result for scores outside configured ranges, rather than failing the whole report', () => {
    // Deliberately more lenient than ResultComputationService.gradeFor (which
    // throws) -- this path backs report-card rendering, where a single
    // out-of-range score shouldn't take down the whole document.
    const scale = [{ minScore: 50, maxScore: 100, grade: 'PASS' }];

    expect((service as any).calculateGradeFromScale(49, scale)).toEqual({
      grade: 'Ungraded',
      remark: 'Score falls outside configured grading ranges',
      gradePoint: null,
      classOfResult: null,
    });
  });

  it('calculates CGPA from configured grade points only when all eligible records have points', () => {
    const scale = [
      { minScore: 75, maxScore: 100, grade: 'A1', gradePoint: 5 },
      { minScore: 50, maxScore: 74.99, grade: 'C6', gradePoint: 2.5 },
    ];
    const records = [
      { total: 80, isEligible: true },
      { total: 60, isEligible: true },
      { total: 40, isEligible: false },
    ];

    expect((service as any).calculateAverageGradePoint(records, scale)).toBe(
      3.75,
    );
  });
});
