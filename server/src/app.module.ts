import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { TicketsModule } from './tickets/tickets.module';
import { AdminAction } from './entities/admin_action.entity';
import { AIResult } from './entities/ai_result.entity';
import { Session } from './entities/session.entity';
import { TicketStatusHistory } from './entities/ticket_status_history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:  'localhost',
      port:  5432,
      username:  'AI_tickets',
      password:  'AI_tickets',
      database:  'support_tickets',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
    }),
    TicketsModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([AdminAction]),
    TypeOrmModule.forFeature([AIResult]),
    TypeOrmModule.forFeature([Session]),
    TypeOrmModule.forFeature([TicketStatusHistory]),
  ],
})
export class AppModule {}
