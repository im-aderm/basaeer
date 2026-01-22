import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Prisma, UserRole } from '../generated/client/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    create(@Body() data: Prisma.AcademicSessionCreateInput) {
        return this.sessionsService.create(data);
    }

    @Get()
    @Public()
    findAll() {
        return this.sessionsService.findAll();
    }

    @Get('active')
    @Public()
    findActive() {
        return this.sessionsService.findActive();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() data: Prisma.AcademicSessionUpdateInput) {
        return this.sessionsService.update(id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.sessionsService.remove(id);
    }
}
