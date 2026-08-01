import { REPORT_TEMPLATE_TYPES } from './built-in-templates';

/**
 * Representative fixture data for each report type, shaped exactly like
 * ExamsService.formatReportData/formatAnnualReportData's real output — used
 * to render a live preview of a template an admin is still editing, without
 * needing a real student/session/term to already exist.
 */
export const SAMPLE_REPORT_DATA: Record<string, any> = {
  [REPORT_TEMPLATE_TYPES.STUDENT_REPORT]: {
    schoolName: 'AL-BAYAN ISLAMIC SECONDARY SCHOOL, JOS',
    schoolAddress: 'P.O. BOX 3249, Dogon Dutse, Old Army Barracks Jos North, Plateau State.',
    schoolLogo: '',
    schoolWatermark: '',
    studentPhoto: '',
    reportType: 'END OF TERM REPORT SHEET',
    sessionName: '2024/2025',
    nextTermBegins: '2025-09-15',
    termEnds: '2025-07-25',
    timesOpen: 55,
    timesPresent: 55,
    timesAbsent: 0,
    studentName: 'MUHAMMAD ISMAIL ABDULLAHI',
    admissionNo: 'ABS/2024/040',
    gender: 'MALE',
    className: 'JSS 1 A',
    sectionName: 'A',
    termName: 'THIRD TERM',
    formTeacher: 'UMAR IDRIS ABUBAKAR',
    noInClass: 65,
    overallAvg: '83.9',
    totalScore: '1427.0',
    classPosition: '2nd',
    highestAvg: '84.1',
    lowestAvg: '1.0',
    classAverage: '57.4',
    finalGrade: 'A',
    finalRemark: 'Excellent result, keep it up!',
    cgpa: '4.27',
    classOfResult: 'SECOND CLASS UPPER',
    assessmentHeaders: ['ASGN1', 'ASGN2', 'TEST1', 'TEST2', 'Exams'],
    subjects: [
      {
        name: 'English Language',
        dynamicScores: { ASGN1: 10, ASGN2: 10, TEST1: 16, TEST2: 20, Exams: 32 },
        total: '88.0', grade: 'A', position: '1st', outOf: 64, low: '1.0', high: '88.0', classAvg: '53.8', remark: 'Excellent',
      },
      {
        name: 'Mathematics',
        dynamicScores: { ASGN1: 10, ASGN2: 10, TEST1: 19, TEST2: 20, Exams: 30 },
        total: '89.0', grade: 'A', position: '1st', outOf: 62, low: '15.0', high: '89.0', classAvg: '55.0', remark: 'Excellent',
      },
      {
        name: 'Basic Science',
        dynamicScores: { ASGN1: 10, ASGN2: 7, TEST1: 18, TEST2: 13, Exams: 26 },
        total: '74.0', grade: 'A', position: '6th', outOf: 62, low: '26.0', high: '80.0', classAvg: '53.5', remark: 'Excellent',
      },
    ],
    behavioural: [
      { category: 'Punctuality', rating: 'B' },
      { category: 'Attendance in class', rating: 'B' },
      { category: 'Attentiveness in class', rating: 'B' },
      { category: 'Carrying out assignments', rating: 'C' },
      { category: 'Honesty', rating: 'B' },
    ],
  },
  [REPORT_TEMPLATE_TYPES.ANNUAL_CUMULATIVE]: {
    schoolName: 'AL-BAYAN ISLAMIC SECONDARY SCHOOL, JOS',
    schoolLogo: '',
    schoolWatermark: '',
    logoUrl: null,
    primaryColor: '#2563EB',
    sessionName: '2024/2025',
    studentName: 'MARWAN ISMAIL ABDULLAHI',
    studentPhoto: null,
    className: 'JSS 1 A',
    classPosition: '3rd',
    behaviouralRatings: {
      punctuality: 'B',
      classAttendance: 'B',
      attentiveness: 'B',
      carryingOutAssignments: 'C',
      participation: 'C',
      neatness: 'B',
      honesty: 'B',
      selfControl: 'C',
    },
    totalAnnualScore: '1204.0',
    overallAnnualAvg: '86.0',
    cgpa: '4.17',
    classOfResult: 'SECOND CLASS UPPER',
    promotionStatus: 'PROMOTED',
    finalRemark: 'A very good performance, keep trying.',
    subjects: [
      {
        name: 'English', term1Score: '79.0', term1Pos: '4th', term1Grade: 'B',
        term2Score: '66.0', term2Pos: '2nd', term2Grade: 'B',
        term3Score: '77.0', term3Pos: '3rd', term3Grade: 'B',
        annualAvg: '74.0', classAvg: '51.2', annualGrade: 'B', annualRemark: 'Very Good',
      },
      {
        name: 'Mathematics', term1Score: '88.0', term1Pos: '3rd', term1Grade: 'A',
        term2Score: '79.0', term2Pos: '4th', term2Grade: 'A',
        term3Score: '90.0', term3Pos: '1st', term3Grade: 'A',
        annualAvg: '85.7', classAvg: '45.2', annualGrade: 'A', annualRemark: 'Excellent',
      },
    ],
  },
};
