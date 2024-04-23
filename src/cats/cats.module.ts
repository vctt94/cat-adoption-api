import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { JwtModule } from "@nestjs/jwt";
import { Cat } from './entities/cat.entity';
import { AuthGuard } from '@/common/guards/auth.guard';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cat]),
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [CatsController],
  providers: [CatsService, AuthGuard],
  exports: [CatsService, TypeOrmModule],
})
export class CatsModule {}
