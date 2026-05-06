import { Controller, Get, Post, Body, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { UserCreatedEvent } from '../../../libs/event_schemas/UserCreatedEvent';
import { PrismaService } from '../../../libs/database/src/prisma.service';
import { JwtAuthGuard } from '../../../libs/security/src/jwt-auth.guard';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly prisma: PrismaService,
  ) { }

  async onModuleInit() {
    if (process.env.KAFKA_BROKER_URL) {
      await this.kafkaClient.connect();
    }
  }

  async onModuleDestroy() {
    if (process.env.KAFKA_BROKER_URL) {
      await this.kafkaClient.close();
      console.log('Kafka client closed gracefully');
    }
  }

  // ── Health ────────────────────────────────────────────────
  @Get('users/health')
  health() {
    return { status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() };
  }

  // ── Protected user creation → Postgres ────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('users')
  async createUser(@Body() event: UserCreatedEvent, @Req() request: any) {
    // request.user now contains the verified JWT payload
    const user = await this.prisma.user.create({
      data: {
        email: event.data.email,
        role: event.data.role,
      },
    });

    return {
      status: 'Secure Request Processed',
      db_id: user.id,
      kafka_eventId: event.eventId,
    };
  }
}
