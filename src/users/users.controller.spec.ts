import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpException } from '@nestjs/common';
import { Role } from '@/common/entities/role.entity';
import { Gender } from '@/common/entities/gender.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
            addFavoriteCat: jest.fn(),
            removeFavoriteCat: jest.fn(),
          }
        }
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('findOneByEmail', () => {
    it('should return a user object if found', async () => {
      const email = 'john@example.com';
      const expectedUser = { id: 1, email: email, name: 'John Doe', password: 'hashed', role: Role.User, createdAt: new Date() };
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(expectedUser);

      expect(await controller.findOneByEmail(email)).toBe(expectedUser);
    });

    it('should throw a NotFoundException if no user is found', async () => {
      const email = 'john@example.com';
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(undefined);

      await expect(controller.findOneByEmail(email)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const userDto = { name: 'John Doe', email: 'john@example.com', password: 'pass', role: Role.User };
      const expectedUser = { ...userDto, id: 1, createdAt: new Date() };
      jest.spyOn(service, 'create').mockResolvedValue(expectedUser);

      expect(await controller.create(userDto)).toBe(expectedUser);
    });
  });

  describe('addFavoriteCat', () => {
    it('should add a favorite cat to the user', async () => {
      const userId = 1;
      const catId = 2;
      const expectedUser = {
        id: userId, name: 'John Doe', email: 'john@example.com', password: 'hashed',
        role: Role.User, createdAt: new Date(),
        favoritedCats: [
          { id: catId, name: "Whiskers", breed: "Tabby", gender: Gender.Male, images: [] }
        ]
      };
      jest.spyOn(service, 'addFavoriteCat').mockResolvedValue(expectedUser);

      expect(await controller.addFavoriteCat(userId, catId)).toBe(expectedUser);
    });
  });

  describe('removeFavoriteCat', () => {
    it('should remove a favorite cat from the user', async () => {
      const userId = 1;
      const catId = 2;
      const expectedUser = { id: userId, name: 'John Doe', email: 'john@example.com', password: 'hashed', role: Role.User, createdAt: new Date(), favoritedCats: [] };
      jest.spyOn(service, 'removeFavoriteCat').mockResolvedValue(expectedUser);

      expect(await controller.removeFavoriteCat(userId, catId)).toBe(expectedUser);
    });
  });
});
