import { Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ReaderJobService } from "./common/jobs/services/job.service";
import { ParserService } from "./common/jobs/services/parser.service";
import { DatabaseModule } from "./common/database/database.module";
import { PropertiesController } from "./common/properties/properties.controller";
import { PropertiesService } from "./common/properties/properties.service";
import { UrlSourceService } from "./common/jobs/services/urlSource.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [PropertiesController],
  providers: [
    ReaderJobService,
    ParserService,
    PropertiesService,
    UrlSourceService
  ],
})
export class MainModule {}
