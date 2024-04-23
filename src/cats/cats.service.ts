import {
  HttpException, HttpStatus, Injectable, NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cat } from "./entities/cat.entity";
import { CreateCatDto, UpdateCatDto } from "./dto";

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private catsRepository: Repository<Cat>
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const newCat = this.catsRepository.create(createCatDto);
    await this.catsRepository.save(newCat);
    return newCat;
  }

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.find({ relations: ["favoritedBy"] });
  }

  async findOne(id: number): Promise<Cat> {
    const cat = await this.catsRepository.findOne({
        where: { id },
        relations: ['favoritedBy']
    });
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found.`);
    }
    return cat;
  }

  async update(id: number, updateCatDto: UpdateCatDto): Promise<Cat> {
    const cat = await this.findOne(id);
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found.`);
    }
    const updatedCat = this.catsRepository.merge(cat, updateCatDto);
    return this.catsRepository.save(updatedCat); // Ensure this is returned
  }

  async remove(id: number): Promise<{ message: string }> {
    const cat = await this.findOne(id);
    if (!cat) {
      throw new HttpException(`Cat with ID ${id} not found.`, HttpStatus.NOT_FOUND);
    }
    await this.catsRepository.remove(cat);
    return { message: `Cat ${id} deleted successfully` };
  }
}
