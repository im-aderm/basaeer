import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateQuestionGroupDto,
    CreateQuestionDto,
    CreateOnlineExamDto,
    SubmitAttemptDto
} from './dto/online-exam.dto';
import { QuestionType, AttemptStatus } from '../generated/client/client';

@Injectable()
export class OnlineExamsService {
    constructor(private prisma: PrismaService) { }

    // ==================== Question Group Management ====================
    async createQuestionGroup(dto: CreateQuestionGroupDto) {
        return this.prisma.questionGroup.create({
            data: dto
        });
    }

    async getQuestionGroups(branchId: string) {
        return this.prisma.questionGroup.findMany({
            where: { branchId },
            include: { _count: { select: { questions: true } } }
        });
    }

    // ==================== Question Management ====================
    async createQuestion(dto: CreateQuestionDto) {
        return this.prisma.question.create({
            data: {
                type: dto.type,
                content: dto.content,
                marks: dto.marks,
                groupId: dto.groupId,
                options: dto.options ? {
                    createMany: {
                        data: dto.options
                    }
                } : undefined
            },
            include: { options: true }
        });
    }

    async getQuestionsByGroup(groupId: string) {
        return this.prisma.question.findMany({
            where: { groupId },
            include: { options: true }
        });
    }

    // ==================== Online Exam Management ====================
    async createExam(dto: CreateOnlineExamDto) {
        return this.prisma.onlineExam.create({
            data: {
                ...dto,
                scheduledDate: new Date(dto.scheduledDate)
            }
        });
    }

    async getExams(branchId: string, filters?: { classId?: string; subjectId?: string }) {
        return this.prisma.onlineExam.findMany({
            where: {
                branchId,
                ...filters
            },
            include: {
                class: true,
                subject: true,
                group: { select: { name: true, _count: { select: { questions: true } } } }
            },
            orderBy: { scheduledDate: 'desc' }
        });
    }

    async getExamForStudent(examId: string, studentId: string) {
        const exam = await this.prisma.onlineExam.findUnique({
            where: { id: examId },
            include: {
                group: {
                    include: {
                        questions: {
                            include: {
                                options: {
                                    select: { id: true, content: true } // Don't send isCorrect to student
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!exam) throw new NotFoundException('Exam not found');

        // Check if attempt already exists
        const existingAttempt = await this.prisma.onlineExamAttempt.findUnique({
            where: { examId_studentId: { examId, studentId } }
        });

        if (existingAttempt && existingAttempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException('Exam already submitted');
        }

        // Start attempt if not exists
        if (!existingAttempt) {
            await this.prisma.onlineExamAttempt.create({
                data: { examId, studentId }
            });
        }

        return exam;
    }

    // ==================== Submission & Auto-Grading ====================
    async submitAttempt(studentId: string, dto: SubmitAttemptDto) {
        const attempt = await this.prisma.onlineExamAttempt.findUnique({
            where: { examId_studentId: { examId: dto.examId, studentId } },
            include: { exam: { include: { group: { include: { questions: { include: { options: true } } } } } } }
        });

        if (!attempt) throw new NotFoundException('Attempt not found');
        if (attempt.status !== AttemptStatus.IN_PROGRESS) throw new BadRequestException('Already submitted');

        let totalScore = 0;
        const answerData: any[] = [];

        for (const submittedAnswer of dto.answers) {
            const question = attempt.exam.group.questions.find(q => q.id === submittedAnswer.questionId);
            if (!question) continue;

            let isCorrect = false;
            let marksAwarded = 0;

            if (question.type === QuestionType.MCQ || question.type === QuestionType.TRUE_FALSE) {
                const correctOption = question.options.find(o => o.isCorrect);
                if (correctOption && correctOption.id === submittedAnswer.selectedOptionId) {
                    isCorrect = true;
                    marksAwarded = question.marks;
                    totalScore += marksAwarded;
                }
            }

            answerData.push({
                questionId: question.id,
                selectedOptionId: submittedAnswer.selectedOptionId,
                textAnswer: submittedAnswer.textAnswer,
                isCorrect: question.type !== QuestionType.DESCRIPTIVE ? isCorrect : null,
                marksAwarded: question.type !== QuestionType.DESCRIPTIVE ? marksAwarded : null
            });
        }

        // Update attempt
        return this.prisma.$transaction(async (tx) => {
            // Create answers
            for (const ans of answerData) {
                await tx.questionAnswer.upsert({
                    where: { attemptId_questionId: { attemptId: attempt.id, questionId: ans.questionId } },
                    update: ans,
                    create: { attemptId: attempt.id, ...ans }
                });
            }

            // Finalize attempt
            return tx.onlineExamAttempt.update({
                where: { id: attempt.id },
                data: {
                    status: AttemptStatus.SUBMITTED,
                    endTime: new Date(),
                    score: totalScore
                }
            });
        });
    }

    async getAttempts(examId: string) {
        return this.prisma.onlineExamAttempt.findMany({
            where: { examId },
            include: {
                student: { include: { user: true } },
                answers: { include: { question: true } }
            }
        });
    }

    async gradeDescriptiveAnswer(attemptId: string, questionId: string, marks: number) {
        return this.prisma.$transaction(async (tx) => {
            const answer = await tx.questionAnswer.update({
                where: { attemptId_questionId: { attemptId, questionId } },
                data: { marksAwarded: marks }
            });

            // Recalculate total score
            const allAnswers = await tx.questionAnswer.findMany({
                where: { attemptId }
            });

            const newTotal = allAnswers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);

            await tx.onlineExamAttempt.update({
                where: { id: attemptId },
                data: { score: newTotal }
            });

            return answer;
        });
    }
}
