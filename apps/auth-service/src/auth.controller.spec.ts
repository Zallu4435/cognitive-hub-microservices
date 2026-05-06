import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../../libs/security/src/jwt-auth.guard';

describe('AuthController', () => {
    let controller: AuthController;
    let mockAuthService: Partial<AuthService>;

    beforeEach(async () => {
        mockAuthService = {
            register: jest.fn().mockResolvedValue({ user: { id: '1', email: 'test@test.com' }, access_token: 'mock-token' }),
            login: jest.fn().mockResolvedValue({ user: { id: '1', email: 'test@test.com' }, access_token: 'mock-token' }),
            logout: jest.fn().mockResolvedValue({ message: 'Logged out successfully' }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should register a new user', async () => {
        const result = await controller.register({ email: 'test@test.com', password: 'password123', role: 'developer' });
        expect(result.access_token).toEqual('mock-token');
        expect(mockAuthService.register).toHaveBeenCalledWith('test@test.com', 'password123', 'developer');
    });

    it('should login an existing user', async () => {
        const result = await controller.login({ email: 'test@test.com', password: 'password123' });
        expect(result.access_token).toEqual('mock-token');
        expect(mockAuthService.login).toHaveBeenCalledWith('test@test.com', 'password123');
    });
});
