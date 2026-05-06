import { Test, TestingModule } from '@nestjs/testing';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { ClientKafka } from '@nestjs/microservices';
import { JwtAuthGuard } from '../../../libs/security/src/jwt-auth.guard';

describe('GoalController', () => {
    let controller: GoalController;
    let mockGoalService: Partial<GoalService>;
    let mockKafkaClient: Partial<ClientKafka>;

    beforeEach(async () => {
        mockGoalService = {
            getGoalsByUser: jest.fn().mockResolvedValue({ items: [{ id: '1', title: 'Goal 1', tasks: [] }], meta: { total: 1 } }),
            createGoal: jest.fn().mockResolvedValue({ id: '2', title: 'Goal 2', tasks: [] }),
            completeTask: jest.fn().mockResolvedValue({ id: '1', status: 'DONE' }),
        };

        mockKafkaClient = {
            emit: jest.fn(),
            connect: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GoalController],
            providers: [
                { provide: GoalService, useValue: mockGoalService },
                { provide: 'KAFKA_CLIENT', useValue: mockKafkaClient },
            ],
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

        controller = module.get<GoalController>(GoalController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get goals by user', async () => {
        const req = { user: { sub: 'user-1' } };
        const result: any = await controller.getGoals(req);
        expect(result.items.length).toBe(1);
        expect(mockGoalService.getGoalsByUser).toHaveBeenCalledWith('user-1', 0, 20);
    });

    it('should create a goal', async () => {
        const req = { user: { sub: 'user-1' } };
        const body = { title: 'New Goal', tasks: ['Task 1'] };
        const result = await controller.createGoal(req, body);
        expect(result.id).toBe('2');
        expect(mockGoalService.createGoal).toHaveBeenCalledWith('user-1', 'New Goal', ['Task 1']);
    });

    it('should complete a task', async () => {
        const req = { user: { sub: 'user-1' } };
        const result = await controller.completeTask(req, 'task-1');
        expect(result.status).toBe('DONE');
        expect(mockGoalService.completeTask).toHaveBeenCalledWith('user-1', 'task-1');
    });
});
