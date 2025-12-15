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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_host,
      port: Number(process.env.DB_port),
      username: process.env.DB_username,
      password: process.env.DB_password,
      database: process.env.DB_database,
      autoLoadEntities: true,
      synchronize: false, // Set to false in production
    }),
    TicketsModule,
    MessagesModule,
    UsersModule,
    TypeOrmModule.forFeature([AdminAction]),
    TypeOrmModule.forFeature([AIResult]),
    TypeOrmModule.forFeature([Session]),
    TypeOrmModule.forFeature([TicketStatusHistory]),
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [],
  providers: [OpenAIService],
})
export class AppModule {}
