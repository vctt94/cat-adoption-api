import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "@/common/guards/jwt.guard";
import { AuthGuard } from "@/common/guards/auth.guard";
import { CatsService } from "./cats.service";
import { CreateCatDto } from "./dto/create-cat.dto";
import { UpdateCatDto } from "./dto/update-cat.dto";
import { Role } from "@/common/entities/role.entity";
import { Cat } from "./entities/cat.entity";

@ApiTags('Cats')
@Controller("cats")
@UseInterceptors(ClassSerializerInterceptor)
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  // Docs
  @ApiOperation({ summary: 'Create a new cat (Admin only)' })
  @ApiBody({ type: CreateCatDto })
  @ApiResponse({ status: 201, description: 'Cat successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  // End Docs
  @UseGuards(JwtAuthGuard, RolesGuard, AuthGuard)
  @Roles([Role.Admin])
  @Post()
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  // Docs
  @ApiOperation({ summary: 'Get all cats' })
  @ApiResponse({ status: 200, description: 'Return all cats', type: Cat, isArray: true })
  // End Docs
  @Get()
  findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  // Docs
  @ApiOperation({ summary: 'Get a single cat by ID' })
  @ApiResponse({ status: 200, description: 'Return the cat with the specified ID', type: Cat })
  @ApiResponse({ status: 404, description: 'Cat not found' })
  // End Docs
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Cat> {
    return this.catsService.findOne(id);
  }

  // Docs
  @ApiOperation({ summary: 'Update a cat (Admin only)' })
  @ApiBody({ type: UpdateCatDto })
  @ApiResponse({ status: 200, description: 'Cat successfully updated' })
  @ApiResponse({ status: 404, description: 'Cat not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  // End Docs
  @UseGuards(JwtAuthGuard, RolesGuard, AuthGuard)
  @Roles([Role.Admin])
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCatDto: UpdateCatDto
  ): Promise<Cat> {
    return this.catsService.update(id, updateCatDto);
  }

  // Docs
  @ApiOperation({ summary: 'Delete a cat (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cat successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cat not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  // End Docs
  @UseGuards(JwtAuthGuard, RolesGuard, AuthGuard)
  @Roles([Role.Admin])
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.catsService.remove(id);
  }
}
