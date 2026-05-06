import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { GlobalExceptionFilter } from '../../../libs/exceptions/src/global-exception.filter';
import { setupCors } from '../../../libs/common/src/cors.helper';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ─────────────────────────────────────────────────────────────
// Phase 12 — OpenTelemetry Tracing (MUST be first import)
// Patches http/kafkajs before NestJS loads any modules.
// ─────────────────────────────────────────────────────────────
import '../../../libs/telemetry/src/tracer';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, { bufferLogs: true });

  // Use Pino structured logger
  app.useLogger(app.get(Logger));

  // ── Validation: enforce DTOs on all incoming requests ──────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Strip properties not in the DTO
    forbidNonWhitelisted: true, // Reject requests with unknown properties
    transform: true,            // Auto-transform payloads to DTO instances
  }));

  // Dynamic CORS from environment
  setupCors(app);

  // Payload size limit
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Knowledge Hub OS Auth Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Apply global exception filter for standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT_AUTH_SERVICE || process.env.PORT || 3001;
  await app.listen(port);
  app.get(Logger).log(`🔒 Auth Service running on: http://localhost:${port}`);
}
bootstrap();
