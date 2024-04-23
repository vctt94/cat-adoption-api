import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Gender } from '@/common/entities/gender.enum';

describe('CatsService', () => {
  let service: CatsService;
  let mockCatRepository: Repository<Cat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(Cat),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    mockCatRepository = module.get(getRepositoryToken(Cat));
  });

  describe('create', () => {
    it('should successfully create a cat', async () => {
      const catDto: CreateCatDto = { name: 'Milo', age: 4, breed: 'Tabby', gender: Gender.Male, images: ["image1.png", "image2.png"] };
      const cat: Cat = { ...catDto, id: 1 };
      jest.spyOn(mockCatRepository, 'create').mockReturnValue(cat);
      jest.spyOn(mockCatRepository, 'save').mockResolvedValue(cat);

      expect(await service.create(catDto)).toEqual(cat);
      expect(mockCatRepository.create).toHaveBeenCalledWith(catDto);
      expect(mockCatRepository.save).toHaveBeenCalledWith(cat);
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const cat: Cat = { id: 1, name: 'Milo', age: 4, breed: 'Tabby', gender: Gender.Male, images: ["image1.png", "image2.png"]  };
      jest.spyOn(mockCatRepository, 'find').mockResolvedValue([cat]);

      expect(await service.findAll()).toEqual([cat]);
      expect(mockCatRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single cat', async () => {
      const cat: Cat = { id: 1, name: 'Milo', age: 4, breed: 'Tabby', gender: Gender.Male, images: ["image1.png", "image2.png"] };
      jest.spyOn(mockCatRepository, 'findOne').mockResolvedValue(cat);

      expect(await service.findOne(1)).toEqual(cat);
      expect(mockCatRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['favoritedBy'] });
    });

    it('should throw a NotFoundException if cat is not found', async () => {
      jest.spyOn(mockCatRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update cat details', async () => {
      const cat: Cat = {
        id: 1,
        name: 'Milo',
        age: 4,
        breed: 'Tabby',
        gender: Gender.Male,
        images: ["image1.png", "image2.png"]
      };
      const updateDto: UpdateCatDto = { name: 'Oscar' };
      const expectedUpdatedCat: Cat = { ...cat, ...updateDto };
  
      const mergedCat = { ...cat, ...updateDto };  // Manually simulate what merge would do
  
      jest.spyOn(mockCatRepository, 'findOne').mockResolvedValue(cat);  // Mock findOne to return the cat
      jest.spyOn(mockCatRepository, 'merge').mockReturnValue(mergedCat);
      jest.spyOn(mockCatRepository, 'save').mockResolvedValue(mergedCat);
  
      const result = await service.update(1, updateDto);
      expect(result).toEqual(expectedUpdatedCat);
      expect(mockCatRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['favoritedBy'] });
      expect(mockCatRepository.save).toHaveBeenCalledWith(mergedCat);
    });
  });

  describe('remove', () => {
    it('should remove the cat', async () => {
      const cat: Cat = { id: 1, name: 'Milady', breed: 'Tabby', gender: Gender.Female, images: ["image1.png", "image2.png"] };
      jest.spyOn(mockCatRepository, 'findOne').mockResolvedValue(cat);
      jest.spyOn(mockCatRepository, 'remove').mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockCatRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['favoritedBy'] });
      expect(mockCatRepository.remove).toHaveBeenCalledWith(cat);
    });

    it('should throw a NotFoundException if cat to remove is not found', async () => {
      jest.spyOn(mockCatRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
