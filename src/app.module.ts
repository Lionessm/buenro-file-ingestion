import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MainModule } from './modules/main.module';


@Module({
  imports: [
    MainModule
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
