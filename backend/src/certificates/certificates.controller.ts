import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CreateCertificateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    create(@Body() createCertificateDto: CreateCertificateDto, @Request() req) {
        return this.certificatesService.create(createCertificateDto, req.user.userId);
    }

    @Get()
    findAll(@Query('branchId') branchId: string) {
        return this.certificatesService.findAll(branchId);
    }

    @Get('templates')
    findAllTemplates(@Query('branchId') branchId: string) {
        return this.certificatesService.findAllTemplates(branchId);
    }

    @Get('verify/:code')
    async verify(@Param('code') code: string) {
        return this.certificatesService.verify(code);
    }

    @Get('my-certificates')
    findMyCertificates(@Request() req) {
        return this.certificatesService.findByUser(req.user.userId);
    }

    @Get('student/:studentId')
    findByStudent(@Param('studentId') studentId: string) {
        return this.certificatesService.findByStudent(studentId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.certificatesService.findOne(id);
    }

    @Get(':id/pdf')
    async exportPdf(@Param('id') id: string) {
        const buffer = await this.certificatesService.generatePDF(id);
        return buffer.toString('base64');
    }

    @Delete('templates/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    removeTemplate(@Param('id') id: string) {
        return this.certificatesService.removeTemplate(id);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    remove(@Param('id') id: string) {
        return this.certificatesService.remove(id);
    }

    @Post('templates')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createTemplate(@Body() dto: CreateCertificateTemplateDto) {
        return this.certificatesService.createTemplate(dto);
    }
}
