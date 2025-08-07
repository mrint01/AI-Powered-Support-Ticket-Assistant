import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { OpenAIService } from '../openai.service';
import { AIResult, PriorityLevel } from '../entities/ai_result.entity';
import { MessagesService } from '../messages/messages.service';
import { MessageType } from '../entities/message.entity';
import { TicketStatusHistory } from '../entities/ticket_status_history.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketStatusHistory)
    private readonly ticketStatusHistoryRepository: Repository<TicketStatusHistory>,
    private readonly openAIService: OpenAIService,
    @InjectRepository(AIResult)
    private readonly aiResultRepository: Repository<AIResult>,
    private readonly messagesService: MessagesService,
  ) {}

  async create(data: Partial<Ticket>, userId: number) {
    // Call OpenAI to get priority and summary
    const { priority, summary } = await this.openAIService.prioritizeAndSummarize(
      data.title,
      data.description,
    );
    const ticket = this.ticketRepository.create({
      ...data,
      priority,
      user: { id: userId },
    });
    const savedTicket = await this.ticketRepository.save(ticket);

    // Save AI result
    const aiResult = this.aiResultRepository.create({
      ticket: savedTicket,
      summary,
      priority: priority as PriorityLevel,
    });
    await this.aiResultRepository.save(aiResult);

    // Create initial message from the ticket description
    await this.messagesService.createMessage(
      savedTicket.id,
      userId,
      data.description,
      MessageType.CLIENT,
    );

    return savedTicket;
  }

  findAll() {
    return this.ticketRepository.find({
      relations: ['user', 'ai_results', 'messages'],
    });
  }

  findAllForUser(userId: number) {
    return this.ticketRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'ai_results', 'messages'],
    });
  }

  findOne(id: string) {
    return this.ticketRepository.findOne({ 
      where: { id: parseInt(id) }, 
      relations: ['user', 'messages', 'messages.sender'] 
    });
  }

  async update(id: string, data: Partial<Ticket>, userId?: number) {
    // Get the current ticket to check if status is changing
    const currentTicket = await this.ticketRepository.findOne({ 
      where: { id: parseInt(id) },
      relations: ['user']
    });

    if (!currentTicket) {
      throw new Error('Ticket not found');
    }

    // Check if status is being updated
    if (data.status && data.status !== currentTicket.status && userId) {
      // Create history record
      const historyRecord = this.ticketStatusHistoryRepository.create({
        ticket: currentTicket,
        oldStatus: currentTicket.status,
        newStatus: data.status,
        changedBy: { id: userId },
        notes: data.status === 'resolved' ? 'Ticket marked as resolved' : 
               data.status === 'closed' ? 'Ticket closed' :
               data.status === 'in progress' ? 'Ticket moved to in progress' : 
               'Status updated'
      });

      await this.ticketStatusHistoryRepository.save(historyRecord);
    }

    return this.ticketRepository.update(id, data);
  }

  remove(id: string) {
    return this.ticketRepository.delete(id);
  }

  async getTicketHistory(ticketId: string) {
    return this.ticketStatusHistoryRepository.find({
      where: { ticket: { id: parseInt(ticketId) } },
      relations: ['changedBy'],
      order: { changedAt: 'DESC' }
    });
  }
}
