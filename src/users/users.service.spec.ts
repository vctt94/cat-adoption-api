import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Cat } from '@/cats/entities/cat.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let catsRepository: Repository<Cat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cat),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    catsRepository = module.get<Repository<Cat>>(getRepositoryToken(Cat));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersRepository).toBeDefined();
    expect(catsRepository).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user if a user is found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
  });
  
  describe('create', () => {
    it('should save a new user record and return that', async () => {
      const mockUser = { email: 'newuser@example.com' };
      usersRepository.save = jest.fn().mockResolvedValue(mockUser);
      const result = await service.create(mockUser);
      expect(result).toEqual(mockUser);
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
  
  describe('addFavoriteCat', () => {
    it('should add a favorite cat to the user', async () => {
      const mockUser = { id: 1, favoritedCats: [] };
      const mockCat = { id: 2 };
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      catsRepository.findOne = jest.fn().mockResolvedValue(mockCat);
      usersRepository.save = jest.fn().mockResolvedValue({
        ...mockUser,
        favoritedCats: [mockCat],
      });
  
      const result = await service.addFavoriteCat(1, 2);
      expect(result.favoritedCats).toHaveLength(1);
      expect(result.favoritedCats[0]).toEqual(mockCat);
    });
  });
  
  describe('removeFavoriteCat', () => {
    it('should remove a favorite cat from the user', async () => {
      const mockCat = { id: 2 };
      const mockUser = { id: 1, favoritedCats: [mockCat] };
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      usersRepository.save = jest.fn().mockResolvedValue({
        ...mockUser,
        favoritedCats: [],
      });
  
      const result = await service.removeFavoriteCat(1, 2);
      expect(result.favoritedCats).toHaveLength(0);
    });
  });
  
});
