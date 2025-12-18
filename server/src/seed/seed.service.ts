import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../entities/user.entity';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../entities/ticket.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  async onModuleInit() {
    console.log('🌱 Running seed...');

    const usersCount = await this.userRepo.count();
    if (usersCount > 0) {
      console.log('🌱 Seed skipped (data exists)');
      return;
    }

    // ---------- USERS ----------
    const system = this.userRepo.create({
      username: 'system',
      email: 'system@test.com',
      passwordHash: await bcrypt.hash('system', 10),
      role: UserRole.SYSTEM,
    });
    const admin = this.userRepo.create({
      username: 'admin',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('admin', 10),
      role: UserRole.ADMIN,
    });

    const user = this.userRepo.create({
      username: 'user',
      email: 'user@test.com',
      passwordHash: await bcrypt.hash('user123', 10),
      role: UserRole.USER,
    });

    await this.userRepo.save([system, admin, user]);

    // ---------- TICKETS ----------
    const ticket1 = this.ticketRepo.create({
      title: 'Cannot login',
      description: 'Login fails with wrong password error',
      status: TicketStatus.Open,
      priority: TicketPriority.HIGH,
      user: user,
    });

    const ticket2 = this.ticketRepo.create({
      title: 'Page crashes',
      description: 'Dashboard crashes on load',
      status: TicketStatus.Open,
      priority: TicketPriority.MEDIUM,
      user: user,
    });

    await this.ticketRepo.save([ticket1, ticket2]);

    console.log('🌱 Seed completed');
  }
}
