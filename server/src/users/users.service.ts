import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(username: string, email: string, password: string) {
    // Check for existing username or email
    const existingUser = await this.userRepository.findOne({
      where: [
        { username },
        { email },
      ],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new BadRequestException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new BadRequestException('Email already exists');
      }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      role: UserRole.USER,
    });
    return this.userRepository.save(user);
  }

  async login(identifier: string, password: string) {
    // identifier can be username or email
    const user = await this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
      ],
    });
    if (!user) {
      throw new BadRequestException('Invalid username/email or password');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid username/email or password');
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
} 