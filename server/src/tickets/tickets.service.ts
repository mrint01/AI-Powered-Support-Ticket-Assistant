import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { OpenAIService } from '../openai.service';
import { AIResult, PriorityLevel } from '../entities/ai_result.entity';
import { MessagesService } from '../messages/messages.service';
import { MessageType } from '../entities/message.entity';
import { TicketStatusHistory } from '../entities/ticket_status_history.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import axios from 'axios';

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

  async create(data: CreateTicketDto, userId: number) {
    // Call OpenAI to get priority, summary, and suggested response
    const { priority, summary, suggested_response } =
      await this.openAIService.prioritizeAndSummarize(
        data.title,
        data.description,
      );
    const ticket = this.ticketRepository.create({
      title: data.title,
      description: data.description,
      priority,
      user: { id: userId },
    });
    const savedTicket = await this.ticketRepository.save(ticket);

    // Save AI result including suggested response
    const aiResult = this.aiResultRepository.create({
      ticket: savedTicket,
      summary,
      priority: priority as PriorityLevel,
      suggested_response: suggested_response || null,
    });
    await this.aiResultRepository.save(aiResult);

    // Create initial message from the ticket description
    await this.messagesService.createMessage(
      savedTicket.id,
      userId,
      data.description,
      MessageType.CLIENT,
    );

    // Create a SYSTEM message for support staff
    await this.messagesService.createMessage(
      savedTicket.id,
      null, // System message has no sender
      `Thanks for contacting Support.
We’ve received your ticket and it’s currently being reviewed.
Reference ID: #${savedTicket.id}.`,
      MessageType.ADMIN,
      false, // Not internal - visible to both admin and user
    );

    // call springboot to update ticket status
    console.log('call springboot');
    await axios
      .post(
        `${process.env.SPRING_WORKFLOW_URL}/spring/tickets/${savedTicket?.id}/start`,
      )
      .catch((err) => {
        console.log('error calling springboot api: ', err);
      });
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
      relations: ['user', 'messages', 'messages.sender'],
    });
  }

  async update(id: string, data: Partial<Ticket>, userId?: number) {
    // Get the current ticket to check if status is changing
    const currentTicket = await this.ticketRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['user'],
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
        notes:
          data.status === 'resolved'
            ? 'Ticket marked as resolved'
            : data.status === 'closed'
              ? 'Ticket closed'
              : data.status === 'in progress'
                ? 'Ticket moved to in progress'
                : 'Status updated',
      });

      await this.ticketStatusHistoryRepository.save(historyRecord);
    }

    return this.ticketRepository.update(id, data);
  }

  async remove(id: string) {
    const ticketId = parseInt(id);

    // Delete all ticket status history records first
    await this.ticketStatusHistoryRepository.delete({
      ticket: { id: ticketId },
    });

    // Then delete the ticket
    return this.ticketRepository.delete(ticketId);
  }

  async getTicketHistory(ticketId: string) {
    return this.ticketStatusHistoryRepository.find({
      where: { ticket: { id: parseInt(ticketId) } },
      relations: ['changedBy'],
      order: { changedAt: 'DESC' },
    });
  }

  async getAISuggestedResponse(ticketId: string) {
    const aiResult = await this.aiResultRepository.findOne({
      where: { ticket: { id: parseInt(ticketId) } },
      relations: ['ticket'],
    });
    return aiResult?.suggested_response || null;
  }
}
