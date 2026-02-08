import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateIdCardTemplateDto } from './dto/create-template.dto';
import { UpdateIdCardTemplateDto } from './dto/update-template.dto';
import { GenerateIdCardsDto } from './dto/generate-cards.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client';

@Controller('cards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardsController {
    constructor(private readonly cardsService: CardsService) { }

    // Templates
    @Post('templates')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createTemplate(@Body() createDto: CreateIdCardTemplateDto) {
        return this.cardsService.createTemplate(createDto);
    }

    @Get('templates')
    findAllTemplates(@Query('branchId') branchId: string, @Request() req) {
        return this.cardsService.findAllTemplates(branchId || req.user.branchId);
    }

    @Get('templates/:id')
    findTemplate(@Param('id') id: string) {
        return this.cardsService.findTemplate(id);
    }

    @Patch('templates/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateTemplate(@Param('id') id: string, @Body() updateDto: UpdateIdCardTemplateDto) {
        return this.cardsService.updateTemplate(id, updateDto);
    }

    @Delete('templates/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    removeTemplate(@Param('id') id: string) {
        return this.cardsService.deleteTemplate(id);
    }

    // ID Cards
    @Post('generate')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    generate(@Body() generateDto: GenerateIdCardsDto) {
        return this.cardsService.generateCards(generateDto);
    }

    @Get()
    findAll(@Query('branchId') branchId: string, @Query('sessionId') sessionId: string, @Request() req) {
        return this.cardsService.findAllCards(branchId || req.user.branchId, sessionId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cardsService.findCard(id);
    }
}
