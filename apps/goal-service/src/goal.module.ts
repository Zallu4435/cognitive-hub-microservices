import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { GoalController, HealthController } from './goal.controller';
import { GoalService } from './goal.service';
import { DatabaseModule } from '../../../libs/database/src/database.module';
import { KafkaModule } from '../../../libs/kafka/src/kafka.module';
import { RedisService } from '../../../libs/security/src/redis.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),

        LoggerModule.forRoot({
            pinoHttp: {
                name: 'goal-service',
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
    controllers: [HealthController, GoalController],
    providers: [GoalService, RedisService],
})
export class GoalModule { }
