import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from '../entities/ticket.entity';
import { AIResult } from '../entities/ai_result.entity';
import { OpenAIService } from 'src/openai.service';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, AIResult]),
    MessagesModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService, OpenAIService],
})
export class TicketsModule {}
