import { Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ReaderJobService } from "./common/jobs/job.service";
import { ParserService } from "./common/jobs/parser.service";

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
    ParserService
  ],
})
export class MainModule {}
