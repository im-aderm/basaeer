import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateIdCardTemplateDto } from './dto/create-template.dto';
import { UpdateIdCardTemplateDto } from './dto/update-template.dto';
import { GenerateIdCardsDto } from './dto/generate-cards.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('ID Cards')
@Controller('cards')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // Templates
  @ApiBearerAuth()
  @ApiBody({ type: CreateIdCardTemplateDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Template' })
  @Post('templates')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createTemplate(@Body() createDto: CreateIdCardTemplateDto) {
    return this.cardsService.createTemplate(createDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Templates' })
  @Get('templates')
  findAllTemplates(
    @Query('branchId') branchId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.cardsService.findAllTemplates(branchId || ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Template' })
  @Get('templates/:id')
  findTemplate(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.cardsService.findTemplate(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateIdCardTemplateDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Template' })
  @Patch('templates/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateTemplate(
    @Param('id') id: string,
    @Body() updateDto: UpdateIdCardTemplateDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.cardsService.updateTemplate(id, updateDto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Template' })
  @Delete('templates/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  removeTemplate(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.cardsService.deleteTemplate(id, ctx);
  }

  // ID Cards
  @ApiBearerAuth()
  @ApiBody({ type: GenerateIdCardsDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Generate' })
  @Post('generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  generate(@Body() generateDto: GenerateIdCardsDto) {
    return this.cardsService.generateCards(generateDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  findAll(
    @Query('branchId') branchId: string,
    @Query('sessionId') sessionId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.cardsService.findAllCards(branchId || ctx.branchId!, sessionId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.cardsService.findCard(id, ctx);
  }
}
