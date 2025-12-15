import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() body: { username: string; email: string; password: string },
    @Req() req: Request,
  ) {
    const { username, email, password } = body;
    if (!username || !email || !password) {
      throw new BadRequestException('All fields are required');
    }
    const user = await this.usersService.register(username, email, password);
    // Log in the user after registration
    (req.session as any).userId = user.id;
    (req.session as any).userRole = user.role;
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Post('login')
  async login(
    @Body() body: { identifier: string; password: string },
    @Req() req: Request,
  ) {
    const { identifier, password } = body;
    if (!identifier || !password) {
      throw new BadRequestException('All fields are required');
    }
    const user = await this.usersService.login(identifier, password);
    (req.session as any).userId = user.id;
    (req.session as any).userRole = user.role;
    return user;
  }

  @Get('me')
  async me(@Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) return null;
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  @Get('logout')
  async logout(@Req() req: Request) {
    (req.session as any).userId = null;
    (req.session as any).userRole = null;
    return (req.session as any).userId;
  }
}
