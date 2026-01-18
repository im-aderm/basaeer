import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.certificatesService.findOne(id);
    }

    @Get('student/:studentId')
    findByStudent(@Param('studentId') studentId: string) {
        return this.certificatesService.findByStudent(studentId);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    remove(@Param('id') id: string) {
        return this.certificatesService.remove(id);
    }
}
