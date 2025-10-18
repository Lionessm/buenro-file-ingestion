import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PropertiesModel, PropertiesSchema } from './models/propertiesDb.model';
import { PropertiesRepository } from './repositories/propertiesDb.repository';
import { PropertiesDbService } from './services/propertiesDb.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://buenro_user:buenro_password@localhost:27017/buenro_db', // put in env
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: PropertiesModel.name, schema: PropertiesSchema }
    ]),
  ],
  providers: [PropertiesRepository, PropertiesDbService],
  exports: [PropertiesRepository, PropertiesDbService],
})
export class DatabaseModule {}