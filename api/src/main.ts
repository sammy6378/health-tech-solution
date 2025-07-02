import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('MediConnect API')
    .setDescription(
      'API documentation for the Tech Health Solution application [MediConnect] developed by Nuvex Tech Solutions. This API provides endpoints for user management, file uploads, and event handling.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory());

  // port configuration
  const configService = app.get(ConfigService);

  // const isProduction = process.env.NODE_ENV === 'production';
  const PORT = configService.getOrThrow<number>('PORT');

  await app.listen(PORT);
}
bootstrap();
