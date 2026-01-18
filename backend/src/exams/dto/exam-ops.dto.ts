import { Term, ExamTerm } from '../../generated/client/client';

export class CreateAcademicSessionDto {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    branchId?: string;
}

export class CreateAssessmentRecordDto {
    studentId: string;
    subjectId: string;
    sectionId: string;
    sessionId: string;
    term: Term;
    examTerm: ExamTerm;

    asgn1?: number;
    asgn2?: number;
    test1?: number;
    test2?: number;
    examScore?: number;

    isEligible?: boolean;
}

export class BulkSubmitScoresDto {
    subjectId: string;
    sectionId: string;
    sessionId: string;
    term: Term;
    examTerm: ExamTerm;
    scores: {
        studentId: string;
        asgn1?: number;
        asgn2?: number;
        test1?: number;
        test2?: number;
        examScore?: number;
    }[];
}

export class RecordBehaviouralDto {
    studentId: string;
    sessionId: string;
    term: Term;

    punctuality?: string;
    classAttendance?: string;
    attentiveness?: string;
    neatness?: string;
    honesty?: string;
    selfControl?: string;
    relationships?: string;
    sports?: string;
    toolHandling?: string;
    branchId?: string;
}
