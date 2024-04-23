import { Injectable, UnauthorizedException, ExecutionContext, CanActivate } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "@/users/users.service";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("No token provided.");
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.usersService.findOneByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException("User not found or inactive.");
      }
      request.user = this.omitPassword(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid token or authorization failed.");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(" ");
    return type === "Bearer" && token ? token : undefined;
  }

  private omitPassword(user: any): any {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
