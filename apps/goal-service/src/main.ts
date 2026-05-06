import { NestFactory } from '@nestjs/core';
import { GoalModule } from './goal.module';
import { GlobalExceptionFilter } from '../../../libs/exceptions/src/global-exception.filter';
import { setupCors } from '../../../libs/common/src/cors.helper';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(GoalModule, { bufferLogs: true });

    // Use Pino structured logger
    app.useLogger(app.get(Logger));

    // Dynamic CORS from environment
    setupCors(app);

    // Payload size limit
    app.use(json({ limit: '100kb' }));
    app.use(urlencoded({ extended: true, limit: '100kb' }));

    // Swagger Documentation
    const config = new DocumentBuilder()
        .setTitle('Goal Service')
        .setDescription('Knowledge Hub OS Goal Service')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Apply global exception filter for standardized error responses
    app.useGlobalFilters(new GlobalExceptionFilter());

    const port = process.env.PORT_GOAL_SERVICE || process.env.PORT || 3002;
    await app.listen(port);
    app.get(Logger).log(`🎯 Goal Service running on: http://localhost:${port}`);
}
bootstrap();
