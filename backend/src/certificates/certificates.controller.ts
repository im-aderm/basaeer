import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CreateCertificateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import { Public } from '../auth/public.decorator';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    create(
        @GetTenantContext() context: TenantContext,
        @Body() createCertificateDto: CreateCertificateDto,
    ) {
        return this.certificatesService.create(createCertificateDto, context.userId, context);
    }

    @Get()
    findAll(@GetTenantContext() context: TenantContext) {
        return this.certificatesService.findAll(context);
    }

    @Get('templates')
    findAllTemplates(@GetTenantContext() context: TenantContext) {
        return this.certificatesService.findAllTemplates(context);
    }

    @Get('verify/:code')
    @Public()
    async verify(@Param('code') code: string) {
        return this.certificatesService.verify(code);
    }

    @Get('my-certificates')
    findMyCertificates(@GetTenantContext() context: TenantContext) {
        return this.certificatesService.findByUser(context.userId, context);
    }

    @Get('student/:studentId')
    findByStudent(@GetTenantContext() context: TenantContext, @Param('studentId') studentId: string) {
        return this.certificatesService.findByStudent(studentId, context);
    }

    @Get(':id')
    findOne(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        return this.certificatesService.findOne(id, context);
    }

    @Get(':id/pdf')
    async exportPdf(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        const buffer = await this.certificatesService.generatePDF(id, context);
        return buffer.toString('base64');
    }

    @Delete('templates/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    removeTemplate(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        return this.certificatesService.removeTemplate(id, context);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    remove(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        return this.certificatesService.remove(id, context);
    }

    @Post('templates')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createTemplate(@GetTenantContext() context: TenantContext, @Body() dto: CreateCertificateTemplateDto) {
        return this.certificatesService.createTemplate(dto, context);
    }
}
