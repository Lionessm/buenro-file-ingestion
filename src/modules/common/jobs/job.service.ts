import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { ParserService } from './parser.service';

@Injectable()
export class ReaderJobService {
  private readonly logger = new Logger(ReaderJobService.name);
  private jobRunning = false;

  constructor(
    private readonly parserService: ParserService
  ) {
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    if (this.jobRunning) {
      this.logger.log('Job is already running. Skipping...');
      return;
    }

    this.jobRunning = true;

    try {
      this.logger.log('Starting scheduled S3 read job...');

      await this.parserService.streamJsonFromUrl();
      
      this.logger.log('Job completed successfully');
    } catch (error: unknown) {
      this.logger.error('Error in scheduled job:', error);
    } finally {
      // Always reset the flag, whether success or error
      this.jobRunning = false;
    }
  }
}


// filter sort la mongo request
// filter trebuie filtrru de mongo trimis in post req
// post get all de trimis in body