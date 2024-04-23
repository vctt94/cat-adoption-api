import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Request, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "@/common/guards/jwt.guard";

@ApiTags('Users')
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Docs
  @ApiOperation({ summary: 'Find a user by email' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  // End Docs
  @Get("email/:email")
  async findOneByEmail(@Param("email") email: string): Promise<User | undefined> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // Docs
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: User })
  @ApiResponse({ status: 201, description: 'User successfully created', type: User })
  // End Docs
  @Post()
  async create(@Body() user: Partial<User>): Promise<User> {
    return this.usersService.create(user);
  }

  // Docs
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a favorite cat to a user' })
  @ApiResponse({ status: 200, description: 'Favorite cat added successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  // End Docs
  @Put("cats/:catId/favorite")
  async addFavoriteCat(@Request() req, @Param("catId") catId: number): Promise<User> {
    return this.usersService.addFavoriteCat(req?.user?.id, catId);
  }

  // Docs
  @ApiOperation({ summary: 'Remove a favorite cat from a user' })
  @ApiResponse({ status: 200, description: 'Favorite cat removed successfully', type: User })
  @ApiResponse({ status: 404, description: 'Cat not found' })
  // End Docs
  @Delete("cats/:catId/favorite")
  async removeFavoriteCat(@Request() req, @Param("catId", ParseIntPipe) catId: number): Promise<User> {
    return this.usersService.removeFavoriteCat(req?.user?.id, catId);
  }
}
