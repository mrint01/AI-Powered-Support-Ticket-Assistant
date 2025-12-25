import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { AdminAction } from './entities/admin_action.entity';
import { AIResult } from './entities/ai_result.entity';
import { Session } from './entities/session.entity';
import { TicketStatusHistory } from './entities/ticket_status_history.entity';
import { Message } from './entities/message.entity';
import { OpenAIService } from './openai.service';
import { UsersModule } from './users/users.module';
import { SeedService } from './seed/seed.service';
import { Ticket } from './entities/ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // 👈 TEMPORARY
    }),
    TicketsModule,
    MessagesModule,
    UsersModule,
    TypeOrmModule.forFeature([
      User,
      Ticket,
      AdminAction,
      AIResult,
      Session,
      TicketStatusHistory,
      Message,
    ]),
  ],
  controllers: [],
  providers: [OpenAIService, SeedService],
})
export class AppModule {}
