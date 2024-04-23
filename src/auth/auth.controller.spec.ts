import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from '@/common/entities/role.entity';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: Role.User,
    };

    it('should register a new user', async () => {   
      const result = {
        message: "User successfully registered",
        statusCode: 201,
        user: {
          accessToken: "generated-access-token",
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: Role.User,
          createdAt: new Date(),
        },
      };
    
      jest.spyOn(authService, 'register').mockResolvedValue(result.user);
    
      await expect(controller.register(registerDto)).resolves.toEqual(result);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login a user', async () => {
      const result = {
        accessToken: 'generated-access-token',
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.User,
        createdAt: new Date(),
      };

      authService.login.mockResolvedValue(result);

      await expect(controller.login(loginDto)).resolves.toEqual(result);
    });

    it('should throw HttpException if login fails', async () => {
      authService.login.mockRejectedValue(new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED));

      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);
    });

  });
});