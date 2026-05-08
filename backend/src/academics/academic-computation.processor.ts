import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ResultComputationService } from '../exams/result-computation.service';

@Processor('academic-computations')
export class AcademicComputationProcessor extends WorkerHost {
  private readonly logger = new Logger(AcademicComputationProcessor.name);

  constructor(
    private readonly computationService: ResultComputationService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { sectionId, sessionId, term, context } = job.data;
    
    this.logger.log(`Processing computation for section ${sectionId}, session ${sessionId}, term ${term}`);

    try {
      // Set initial progress
      await job.updateProgress(10);
      
      const result = await this.computationService.computeSection(
        sectionId, 
        sessionId, 
        term, 
        context
      );

      await job.updateProgress(100);
      this.logger.log(`Computation completed for section ${sectionId}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Computation failed for section ${sectionId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
