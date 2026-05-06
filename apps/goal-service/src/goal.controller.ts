import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards, Inject, OnModuleInit, OnModuleDestroy, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { JwtAuthGuard } from '../../../libs/security/src/jwt-auth.guard';
import { GoalService } from './goal.service';

// Public health endpoint (no auth guard)
@Controller()
export class HealthController {
    @Get('health')
    health() {
        return { status: 'ok', service: 'goal-service', timestamp: new Date().toISOString() };
    }
}

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalController implements OnModuleInit {
    constructor(
        private readonly goalService: GoalService,
        @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka
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

    // Fetch all goals and their related tasks for the logged-in user
    @Get()
    async getGoals(
        @Req() req: any,
        @Query('skip') skip?: string,
        @Query('take') take?: string
    ) {
        const skipNumber = skip ? parseInt(skip, 10) : 0;
        const takeNumber = take ? parseInt(take, 10) : 20;
        return this.goalService.getGoalsByUser(req.user.sub, skipNumber, takeNumber);
    }

    @Post()
    async createGoal(@Req() req: any, @Body() body: { title: string; tasks: string[] }) {
        return this.goalService.createGoal(req.user.sub, body.title, body.tasks);
    }

    @Patch('tasks/:id/complete')
    async completeTask(@Req() req: any, @Param('id') taskId: string) {
        return this.goalService.completeTask(req.user.sub, taskId);
    }
}
