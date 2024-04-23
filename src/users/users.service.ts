import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Cat } from "@/cats/entities/cat.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Cat)
    private catsRepository: Repository<Cat>
  ) {}

  // Find a user by email
  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Create a new user
  async create(user: Partial<User>): Promise<User> {
    return this.usersRepository.save(user);
  }

  async addFavoriteCat(userId: number, catId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoritedCats'],
    });
    const cat = await this.catsRepository.findOne({ where: { id: catId } });
    if (!user || !cat) {
      throw new Error('User or Cat not found');
    }
    // Ensure no duplicates and proper type handling
    if (!user.favoritedCats.some(favCat => favCat.id === cat.id)) {
      user.favoritedCats.push(cat);
    }
    return this.usersRepository.save(user);
  }

  async removeFavoriteCat(userId: number, catId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoritedCats'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    user.favoritedCats = user.favoritedCats.filter(cat => cat.id !== catId);
    return this.usersRepository.save(user);
  }
}
