import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { OnlineExamsService } from './online-exams.service';
import {
    CreateQuestionGroupDto,
    CreateQuestionDto,
    CreateOnlineExamDto,
    SubmitAttemptDto,
    GradeDescriptiveAnswerDto
} from './dto/online-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('online-exams')
export class OnlineExamsController {
    constructor(private readonly examsService: OnlineExamsService) { }

    // ==================== Question Groups ====================
    @Post('groups')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    createGroup(@Body() dto: CreateQuestionGroupDto) {
        return this.examsService.createQuestionGroup(dto);
    }

    @Get('groups')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getGroups(@Request() req) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? req.query.branchId : req.user.branchId;
        return this.examsService.getQuestionGroups(branchId);
    }

    // ==================== Questions ====================
    @Post('questions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    createQuestion(@Body() dto: CreateQuestionDto) {
        return this.examsService.createQuestion(dto);
    }

    @Get('groups/:groupId/questions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getQuestions(@Param('groupId') groupId: string) {
        return this.examsService.getQuestionsByGroup(groupId);
    }

    // ==================== Exams ====================
    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    createExam(@Body() dto: CreateOnlineExamDto) {
        return this.examsService.createExam(dto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    getExams(@Request() req, @Query('classId') classId?: string, @Query('subjectId') subjectId?: string) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? req.query.branchId : req.user.branchId;
        return this.examsService.getExams(branchId, { classId, subjectId });
    }

    @Get(':id/start')
    @Roles(UserRole.STUDENT)
    startExam(@Param('id') id: string, @Request() req) {
        return this.examsService.getExamForStudent(id, req.user.userId);
    }

    @Post('submit')
    @Roles(UserRole.STUDENT)
    submitAttempt(@Request() req, @Body() dto: SubmitAttemptDto) {
        return this.examsService.submitAttempt(req.user.userId, dto);
    }

    // ==================== Grading ====================
    @Get(':id/attempts')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAttempts(@Param('id') id: string) {
        return this.examsService.getAttempts(id);
    }

    @Patch('attempts/:attemptId/questions/:questionId/grade')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    gradeAnswer(
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
        @Body() dto: GradeDescriptiveAnswerDto
    ) {
        return this.examsService.gradeDescriptiveAnswer(attemptId, questionId, dto.marksAwarded);
    }
}
