import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Gender } from '@/common/entities/gender.enum';
import { Cat } from './entities/cat.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@/common/guards/auth.guard';
import { UsersService } from '@/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateCatDto } from './dto';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  beforeEach(async () => {
    // Create a mock CatsService
    const mockCatsService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        CatsService,
        {
          provide: JwtService,
          useValue: { verify: jest.fn(), sign: jest.fn() },
        },
        {
          provide: AuthGuard,
          useValue: jest.fn(() => true),  // Simplified mock; adjust as necessary
        },
        {
          provide: UsersService,
          useValue: { findUser: jest.fn(), createUser: jest.fn() },
        },
        {
          provide: getRepositoryToken(Cat),
          useClass: jest.fn(),
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  describe('create', () => {
    it('should create a cat and return the created data', async () => {
      const createCatDto: CreateCatDto = { name: 'Milo', age: 2, breed: 'Tabby', gender: Gender.Male, images: ["image1.png", "image2.png"] };
      const result: Cat = { id: 1, ...createCatDto };

      jest.spyOn(service, 'create').mockImplementation(async () => result);

      expect(await controller.create(createCatDto)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result: Cat[] = [
        { id: 1, name: 'Milo', age: 2, breed: 'Tabby', gender: Gender.Male, images: ["image1.png", "image2.png"] },
        { id: 2, name: 'Whiskers', age: 5, breed: 'Calico', gender: Gender.Male, images: ["image1.png", "image2.png"] },
        { id: 3, name: 'Milady', breed: 'Tabby', gender: Gender.Female, images: ["image1.png", "image2.png"] }
      ];

      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single cat by ID', async () => {
      const catId = 1;
      const expectedCat: Cat = {
        id: catId,
        name: 'Pixel',
        age: 3,
        breed: 'Siamese',
        gender: Gender.Female,
        images: ["image3.png"],
      };
  
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedCat);
  
      expect(await controller.findOne(catId)).toEqual(expectedCat);
      expect(service.findOne).toHaveBeenCalledWith(catId);
    });
  });

  describe('update', () => {
    it('should update a cat by ID and return the updated data', async () => {
      const catId = 1;
      const updateCatDto: UpdateCatDto = {
        name: 'Updated Pixel',
        age: 4,
        breed: 'Updated Siamese',
        gender: Gender.Male,
        images: ["updated-image1.jpg"],
      };
      const updatedCat: Cat = {
        id: catId,
        name: updateCatDto.name,
        age: updateCatDto.age,
        breed: updateCatDto.breed,
        gender: updateCatDto.gender,
        images: updateCatDto.images,
      };
  
      jest.spyOn(service, 'update').mockResolvedValue(updatedCat);
  
      const result = await controller.update(catId, updateCatDto);
      expect(result).toEqual(updatedCat);
      expect(service.update).toHaveBeenCalledWith(catId, updateCatDto);
    });
  });

  describe('remove', () => {
    it('should remove a cat by ID and return a success message', async () => {
      const catId = 1;
      const removalMessage = { message: `Cat with ID ${catId} removed successfully.` };
  
      jest.spyOn(service, 'remove').mockResolvedValue(removalMessage);
  
      expect(await controller.remove(catId)).toEqual(removalMessage);
      expect(service.remove).toHaveBeenCalledWith(catId);
    });
  });
});