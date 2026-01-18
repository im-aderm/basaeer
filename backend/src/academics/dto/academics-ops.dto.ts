export class CreateAssignmentDto {
    title: string;
    description?: string;
    dueDate: string; // ISO string
    subjectId: string;
    sectionId: string;
}

export class SubmitAssignmentDto {
    assignmentId: string;
    studentId: string;
    contentUrl?: string;
}

export class CreateExamDto {
    title: string;
    date: string; // ISO string
    totalMarks: number;
    subjectId: string;
    sectionId: string;
}

export class RecordGradeDto {
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
}
