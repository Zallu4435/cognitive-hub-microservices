import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from '../../../libs/security/src/redis.service';
import { DatabaseModule } from '../../../libs/database/src/database.module';
import { KafkaModule } from '../../../libs/kafka/src/kafka.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),

        // Rate limiting: max 10 requests per 60 seconds per IP
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),

        LoggerModule.forRoot({
            pinoHttp: {
                name: 'auth-service',
                level: process.env.LOG_LEVEL || 'info',
                transport: process.env.NODE_ENV !== 'production'
                    ? { target: 'pino-pretty', options: { colorize: true } }
                    : undefined,
            },
        }),

        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any },
        }),

        DatabaseModule,
        KafkaModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        RedisService,
        // Apply rate limiting globally to all endpoints in this module
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AuthModule { }
