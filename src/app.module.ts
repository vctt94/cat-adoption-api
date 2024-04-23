import { Module } from '@nestjs/common';
import { DatabaseModule } from "./database/database.module";
import { CatsModule } from './cats/cats.module';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CoreModule,
    AuthModule,
    UsersModule,
    CatsModule,
  ],
})
export class AppModule {}
