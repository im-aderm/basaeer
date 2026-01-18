import { Module } from '@nestjs/common';
import { StudentCategoryService } from './student-category.service';
import { StudentCategoryController } from './student-category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [StudentCategoryController],
    providers: [StudentCategoryService],
    exports: [StudentCategoryService],
})
export class StudentCategoryModule { }
