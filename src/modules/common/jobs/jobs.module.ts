import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { 
  ParserService, 
  UrlSourceService, 
  ReaderJobService 
} from './services';

@Module({
  imports: [DatabaseModule],
  providers: [
    ParserService,
    UrlSourceService,
    ReaderJobService
  ],
  exports: [
    ParserService,
    UrlSourceService,
    ReaderJobService
  ]
})
export class JobsModule {}
