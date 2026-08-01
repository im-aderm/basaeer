import { Test, TestingModule } from '@nestjs/testing';
import { AcademicsService } from './academics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AcademicsService - Assignments', () => {
  let service: AcademicsService;
  let prisma: PrismaService;

  const mockContext = {
    userId: 'user-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: 'TEACHER' as any,
  };

  const mockPrismaService = {
    assignment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    submission: {
      create: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    staff: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AcademicsService>(AcademicsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssignment', () => {
    it('should create a new assignment', async () => {
      const dto = {
        title: 'Math Homework 1',
        description: 'Complete exercises 1-10',
        dueDate: '2026-02-15',
        subjectId: 'subject-123',
        sectionId: 'section-123',
        teacherId: 'teacher-123',
      };

      const mockTeacher = {
        id: 'teacher-123',
        user: { branchId: 'branch-123' },
      };

      const mockAssignment = {
        id: 'assignment-123',
        ...dto,
        dueDate: new Date(dto.dueDate),
        branchId: 'branch-123',
      };

      mockPrismaService.staff.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.assignment.create.mockResolvedValue(mockAssignment);

      const result = await service.createAssignment(dto, mockContext);

      expect(result).toBeDefined();
      expect(result.title).toBe('Math Homework 1');
      expect(mockPrismaService.staff.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.assignment.create).toHaveBeenCalled();
    });
  });

  describe('getAssignments', () => {
    it('should return filtered assignments', async () => {
      const filters = {
        sectionId: 'section-123',
        subjectId: 'subject-math',
      };

      const mockAssignments = [
        {
          id: 'assign-1',
          title: 'Homework 1',
          section: { id: 'section-123', class: { name: 'Grade 10' } },
          subject: { name: 'Mathematics' },
          _count: { submissions: 15 },
        },
      ];

      mockPrismaService.assignment.findMany.mockResolvedValue(mockAssignments);

      const result = await service.getAssignments(filters, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Homework 1');
    });

    it('should filter by teacher ID', async () => {
      const filters = { teacherId: 'teacher-123' };

      mockPrismaService.assignment.findMany.mockResolvedValue([]);

      await service.getAssignments(filters, mockContext);

      expect(mockPrismaService.assignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teacherId: 'teacher-123',
          }),
        }),
      );
    });
  });

  describe('submitAssignment', () => {
    it('should create a submission', async () => {
      const dto = {
        assignmentId: 'assignment-123',
        studentId: 'student-123',
        contentUrl: 'https://drive.google.com/file/123',
      };

      const mockSubmission = {
        id: 'submission-123',
        assignmentId: dto.assignmentId,
        studentId: dto.studentId,
        contentUrl: dto.contentUrl,
        status: 'SUBMITTED',
      };

      mockPrismaService.student.findUnique.mockResolvedValue({ id: dto.studentId });
      mockPrismaService.submission.upsert.mockResolvedValue(mockSubmission);

      const result = await service.submitAssignment(dto, mockContext);

      expect(result).toBeDefined();
      expect(result.status).toBe('SUBMITTED');
      expect(result.contentUrl).toBe(dto.contentUrl);
    });
  });

  describe('gradeSubmission', () => {
    it('should grade a submission with feedback', async () => {
      const submissionId = 'submission-123';
      const grade = 85;
      const feedback = 'Good work! Check question 5.';

      const mockGraded = {
        id: submissionId,
        grade,
        feedback,
        status: 'GRADED',
      };

      mockPrismaService.submission.update.mockResolvedValue(mockGraded);

      mockPrismaService.submission.findFirst.mockResolvedValue(mockGraded);

      const result = await service.gradeSubmission(
        submissionId,
        grade,
        feedback,
        mockContext,
      );

      expect(result.grade).toBe(85);
      expect(result.feedback).toBe(feedback);
      expect(result.status).toBe('GRADED');
    });
  });

  describe('getAssignmentSubmissions', () => {
    it('should return all submissions for an assignment', async () => {
      const assignmentId = 'assignment-123';
      const mockSubmissions = [
        {
          id: 'sub-1',
          student: { user: { firstName: 'John', lastName: 'Doe' } },
          status: 'SUBMITTED',
        },
        {
          id: 'sub-2',
          student: { user: { firstName: 'Jane', lastName: 'Smith' } },
          status: 'GRADED',
          grade: 90,
        },
      ];

      mockPrismaService.assignment.findFirst.mockResolvedValue({ id: assignmentId });
      mockPrismaService.submission.findMany.mockResolvedValue(mockSubmissions);

      const result = await service.getAssignmentSubmissions(assignmentId, mockContext);

      expect(result).toHaveLength(2);
      expect(result[1].grade).toBe(90);
    });
  });

  describe('getStudentAssignments', () => {
    it('should return assignments for a student with their submissions', async () => {
      const studentId = 'student-123';
      const mockStudent = {
        id: studentId,
        sectionId: 'section-123',
      };

      const mockAssignments = [
        {
          id: 'assign-1',
          title: 'Math Homework',
          dueDate: new Date('2026-02-15'),
          subject: { name: 'Mathematics' },
          submissions: [{ id: 'sub-1', status: 'SUBMITTED' }],
        },
        {
          id: 'assign-2',
          title: 'Science Project',
          dueDate: new Date('2026-02-20'),
          subject: { name: 'Science' },
          submissions: [],
        },
      ];

      mockPrismaService.student.findFirst.mockResolvedValue(mockStudent);
      mockPrismaService.assignment.findMany.mockResolvedValue(mockAssignments);

      const result = await service.getStudentAssignments(studentId, mockContext);

      expect(result).toHaveLength(2);
      expect((result[0] as any).submissions).toHaveLength(1);
      expect((result[1] as any).submissions).toHaveLength(0);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue(null);

      await expect(service.getStudentAssignments('invalid-id', mockContext)).rejects.toThrow(
        'Student not found',
      );
    });
  });
});
