import { Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ReaderJobService } from "./common/jobs/job.service";
import { S3ClientService } from "./common/s3.reader/s3.client.read.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    ReaderJobService,
    S3ClientService
  ],
})
export class MainModule {}
