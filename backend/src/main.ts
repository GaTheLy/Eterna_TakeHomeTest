import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true, // Enable CORS at application level
  });

  // Enable CORS for frontend integration (including WebSocket)
  app.enableCors({
    origin: '*', // Allow all origins in development
    credentials: true,
  });

  // Enable global exception filter for consistent error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Task & Schedule Manager API')
    .setDescription(
      'REST API for managing projects, tasks, and schedules with JWT authentication',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth() decorator
    )
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Projects', 'Project management endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .addTag('Schedule', 'Schedule and conflict detection endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
  console.log(`WebSocket server is running on: ws://localhost:${port}`);
}
bootstrap();
