import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * GlobalExceptionFilter — catches ALL unhandled exceptions across every NestJS service.
 *
 * Returns a standardized JSON structure so the Next.js frontend always gets a
 * predictable error shape:
 *   { statusCode, message, timestamp, path }
 *
 * Apply globally in main.ts via:
 *   app.useGlobalFilters(new GlobalExceptionFilter());
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        let errorCode = 'ERR_INTERNAL_SERVER';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();
            
            if (typeof res === 'object' && res !== null) {
                message = (res as any).message || exception.message;
                errorCode = (res as any).error || (res as any).errorCode || `ERR_${HttpStatus[statusCode]}` || 'ERR_HTTP_ERROR';
            } else if (typeof res === 'string') {
                message = res;
                errorCode = `ERR_${HttpStatus[statusCode]}`;
            }
            
            // NestJS class-validator returns message as an array; flatten it
            if (Array.isArray(message)) {
                message = message.join(', ');
                errorCode = 'ERR_VALIDATION_FAILED';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Structured log for debugging and auditing
        this.logger.error({
            statusCode,
            errorCode,
            message,
            path: request.url,
            method: request.method,
            stack: exception instanceof Error ? exception.stack : undefined,
        });

        response.status(statusCode).json({
            statusCode,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
