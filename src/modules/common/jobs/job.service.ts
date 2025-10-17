import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { S3ClientService } from '../s3.reader/s3.client.read.service';

@Injectable()
export class ReaderJobService {
  private readonly logger = new Logger(ReaderJobService.name);

  constructor(
    private readonly s3ClientService: S3ClientService
  ) {
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.log('Starting scheduled S3 read job...');

    // const keys = await this.s3Reader.listObjects(this.bucket, this.prefix);
    const stream = await this.s3ClientService.streamJsonFromUrl();
    return;
  }
}