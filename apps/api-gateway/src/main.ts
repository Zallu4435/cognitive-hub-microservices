import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '../../../libs/exceptions/src/global-exception.filter';
import { setupCors } from '../../../libs/common/src/cors.helper';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ─────────────────────────────────────────────────────────────
// Phase 12 — OpenTelemetry Tracing (must be imported FIRST,
// before any other NestJS modules load, so all auto-instrumentations
// are registered before they patch http/kafka/etc.)
// ─────────────────────────────────────────────────────────────
import '../../../libs/telemetry/src/tracer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino structured logger
  app.useLogger(app.get(Logger));

  // Dynamic CORS from environment
  setupCors(app);

  // Payload size limit to prevent DoS attacks
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Knowledge Hub OS API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Apply global exception filter for standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT_API_GATEWAY || process.env.PORT || 3000;
  await app.listen(port);
  app.get(Logger).log(`🚀 API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
