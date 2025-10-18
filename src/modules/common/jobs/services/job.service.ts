import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ParserService } from './parser.service';
import { UrlSourceService } from './urlSource.service';

@Injectable()
export class ReaderJobService {
  private readonly logger = new Logger(ReaderJobService.name);
  private jobRunning = false;

  constructor(
    private readonly parserService: ParserService,
    private readonly urlSourceService: UrlSourceService
  ) {
  }

  @Cron(CronExpression.EVERY_10_HOURS) // cron or setInterval/setTimeout - doc didn't specify how often
  async handleCron() {
    if (this.jobRunning) {
      this.logger.log('Job is already running. Skipping...');
      return;
    }

    this.jobRunning = true;

    try {
      this.logger.log('Starting scheduled S3 read job...');

      const urls = this.urlSourceService.getUrls();
      for (const url of urls) {
        await this.parserService.streamJsonFromUrl(url);
      }
      
      this.logger.log('Job completed successfully');
    } catch (error: unknown) {
      this.logger.error('Error in scheduled job:', error);
    } finally {
      // Always reset the flag, whether success or error
      this.jobRunning = false;
    }
  }
}