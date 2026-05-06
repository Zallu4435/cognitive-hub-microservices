import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/database/src/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class GoalService {
    constructor(
        private prisma: PrismaService,
        @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka
    ) { }

    async getGoalsByUser(userId: string, skip: number = 0, take: number = 20) {
        const [items, total] = await Promise.all([
            this.prisma.goal.findMany({
                where: { userId: userId },
                include: {
                    tasks: {
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.goal.count({ where: { userId } })
        ]);

        return {
            items,
            meta: {
                total,
                skip,
                take,
                hasMore: skip + take < total
            }
        };
    }

    async createGoal(userId: string, title: string, tasks: string[]) {
        return this.prisma.goal.create({
            data: {
                title,
                userId,
                tasks: {
                    create: tasks.map(t => ({ title: t }))
                }
            },
            include: { tasks: true }
        });
    }

    async completeTask(userId: string, taskId: string) {
        const existingTask = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { goal: true },
        });

        if (!existingTask) {
            throw new NotFoundException(`Task with ID '${taskId}' not found`);
        }

        if (existingTask.goal.userId !== userId) {
            throw new ForbiddenException('You do not have permission to modify this task');
        }

        const task = await this.prisma.task.update({
            where: { id: taskId },
            data: { status: 'DONE' },
            include: { goal: true }
        });

        const eventPayload = {
            eventId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            data: {
                userId: userId,
                goalTitle: task.goal.title,
                taskTitle: task.title
            }
        };

        if (process.env.KAFKA_BROKER_URL) {
            console.log(`[GoalService] Emitting task.completed event for task: ${task.title}`);
            this.kafkaClient.emit('task.completed', eventPayload);
        }

        const aiServiceUrl = process.env.AI_SERVICE_INTERNAL_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL;
        if (!process.env.KAFKA_BROKER_URL && aiServiceUrl) {
            fetch(`${aiServiceUrl}/events/task-completed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventPayload),
            }).catch((err) => console.error('[HTTP-fallback] task event failed:', err));
        }

        return task;
    }
}
