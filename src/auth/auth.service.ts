import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password, role } = dto;
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password

    return {
      accessToken,
      ...userWithoutPassword
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user || !await bcrypt.compare(dto.password, user.password)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password

    return {
      accessToken,
      ...userWithoutPassword
    };
  }
}
