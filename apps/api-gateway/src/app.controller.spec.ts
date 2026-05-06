import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/database/src/prisma.service';
import { JwtAuthGuard } from '../../../libs/security/src/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AppController (API Gateway)', () => {
    let controller: AppController;
    let mockKafkaClient: Partial<ClientKafka>;
    let mockPrismaService: any;

    beforeEach(async () => {
        mockKafkaClient = {
            emit: jest.fn(),
            connect: jest.fn(),
        };

        mockPrismaService = {
            user: {
                create: jest.fn().mockResolvedValue({ id: 'db-user-1', email: 'test@test.com', role: 'developer' }),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                { provide: 'KAFKA_CLIENT', useValue: mockKafkaClient },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = { sub: '1', email: 'test@test.com' };
            return true;
        }})
        .compile();

        controller = module.get<AppController>(AppController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a user and emit event', async () => {
        const event = {
            eventId: 'event-1',
            timestamp: new Date().toISOString(),
            data: { userId: '1', email: 'test@test.com', role: 'developer' }
        };
        const req = { user: { sub: '1' } };

        const result = await controller.createUser(event, req);
        
        expect(result.status).toBe('Secure Request Processed');
        expect(result.db_id).toBe('db-user-1');
        
        if (process.env.KAFKA_BROKER_URL) {
            expect(mockKafkaClient.emit).toHaveBeenCalledWith('user.events', event);
        }
    });
});
