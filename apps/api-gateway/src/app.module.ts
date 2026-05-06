import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { RedisService } from '../../../libs/security/src/redis.service';
import { DatabaseModule } from '../../../libs/database/src/database.module';
import { KafkaModule } from '../../../libs/kafka/src/kafka.module';

@Module({
  imports: [
    // Load .env globally from the monorepo root & make ConfigService injectable everywhere
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),

    // Structured JSON logger (Pino)
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'api-gateway',
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      },
    }),

    JwtModule.register({ global: true }),

    DatabaseModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [RedisService],
})
export class AppModule { }
