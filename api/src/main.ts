import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exceptions.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  // helmet
  app.use(helmet());

  // register global exception filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('MediConnect API')
    .setDescription(
      'API documentation for the Tech Health Solution application [MediConnect] developed by Nuvex Tech Solutions. This API provides endpoints for user management, file uploads, and event handling.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8000', 'Development Server')
    .addServer('https://api.techhealthsolution.com', 'Production Server')
    .addTag('auth', 'Endpoints related to authentication and authorization')
    .addTag('Users', 'Endpoints related to user management')
    .addTag('UserProfile', 'Endpoints related to user profiles')
    .addTag('DoctorProfile', 'Endpoints related to doctor profiles')
    .addTag('Appointments', 'Endpoints related to appointments')
    .addTag('Pharmacy', 'Endpoints related to pharmacy management')
    .addTag('Prescriptions', 'Endpoints related to prescriptions')
    .addTag('Stocks', 'Endpoints related to pharmacy stocks')
    .addTag('Orders', 'Endpoints related to orders')
    .addTag('Upload', 'Endpoints related to file uploads')
    .addTag('MedicalRecords', 'Endpoints related to medical records')
    .addTag('Payments', 'Endpoints related to payments')
    .addTag('Notifications', 'Endpoints related to notifications')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: '/api/docs-json',
    yamlDocumentUrl: '/api/docs-yaml',
    swaggerOptions: {
      persistAuthorization: true, // Persist authorization header
      displayRequestDuration: true, // Display request duration in UI
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically
      filter: true, // Enable filtering
      tryItOutEnabled: true, // Enable "Try it out" feature
      docExpansion: 'none', // Collapse all sections by default
    },
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin-bottom: 20px; }`,
    customSiteTitle: 'MediConnect API Documentation',
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // port configuration
  const configService = app.get(ConfigService);

  // const isProduction = process.env.NODE_ENV === 'production';
  const PORT = configService.getOrThrow<number>('PORT');

  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  };

  app.enableCors(corsOptions);

  await app.listen(PORT);

  Logger.log(`Server is running on http://localhost:${PORT}`);
}
bootstrap();
