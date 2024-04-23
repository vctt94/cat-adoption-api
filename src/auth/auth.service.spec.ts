import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthController } from "./auth.controller";
import { Role } from "@/common/entities/role.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Cat } from "@/cats/entities/cat.entity";
import { User } from "@/users/entities/user.entity";

const userDto = {
  name: "John Doe",
  email: "john@example.com",
  password: "password",
  role: Role.User,
};

const user = {
  id: 1,
  ...userDto,
  password: "hashedPassword",
  createdAt: new Date(),
};

const accessToken = "accessToken";

const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockCatRepository = {
  findOne: jest.fn(),
};


describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Cat),
          useValue: mockCatRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      jest.spyOn(usersService, "findOneByEmail").mockResolvedValueOnce(null);
      jest.spyOn(usersService, "create").mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, "hash").mockResolvedValueOnce(user.password);
      jest.spyOn(jwtService, "sign").mockReturnValueOnce(accessToken);

      const result = await authService.register(userDto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(userDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...userDto, password: user.password
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
      });
      const expected = {
        accessToken,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: expect.any(Date)
      }
      expect(result).toEqual(expected);
    });

    it("should throw ConflictException if user already exists", async () => {
      jest.spyOn(usersService, "findOneByEmail").mockResolvedValueOnce(user);

      await expect(authService.register(userDto)).rejects.toThrowError(
        new ConflictException("User already exists")
      );
    });

    it("should handle unexpected errors during registration", async () => {
      const error = new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
      jest.spyOn(usersService, "findOneByEmail").mockRejectedValueOnce(error);

      await expect(authService.register(userDto)).rejects.toThrowError(error);
    });
  });

  describe("login", () => {
    it("should fail to login with invalid credentials", async () => {
      const hashedPassword = "hashedPassword";
      const plainTextPassword = "plainTextPassword";
      const dto = {
        email: "john@example.com",
        password: plainTextPassword,
      };
      const user = {
        id: 1,
        name: "Test User",
        email: dto.email,
        password: hashedPassword,
        role: Role.User,
        createdAt: new Date(),
      };
  
      // Mock the findOneByEmail method to return the user
      jest.spyOn(usersService, "findOneByEmail").mockResolvedValueOnce(user);
      // Mock bcrypt compare to return false, indicating a password mismatch
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);
  
      // Expect the login to fail due to invalid password
      await expect(authService.login(dto)).rejects.toEqual(
        new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED)
      );
  
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
    });
  });
  
  describe("validateUser", () => {
    it("should validate user based on email", async () => {
      const email = "john@example.com";
      const user = {
        id: 1,
        email,
        name: "John",
        password: "hashedPassword",
        role: Role.User,
        createdAt: new Date(),
      };
  
      jest.spyOn(usersService, "findOneByEmail").mockResolvedValueOnce(user);
      const result = await usersService.findOneByEmail(email);
      
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user);
    });
  });
});
