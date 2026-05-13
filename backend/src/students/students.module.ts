import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentsProcessor } from './students.processor';
import { CommsModule } from '../comms/comms.module';

@Module({
  imports: [
    CommsModule,
    BullModule.registerQueue({ name: 'student-import' }),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, StudentsProcessor],
})
export class StudentsModule {}
