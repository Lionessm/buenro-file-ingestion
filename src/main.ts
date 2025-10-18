import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MainModule } from './modules/main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  await app.listen(3010);
}
bootstrap();
