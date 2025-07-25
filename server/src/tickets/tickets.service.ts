import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { OpenAIService } from '../openai.service';
import { AIResult, PriorityLevel } from '../entities/ai_result.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly openAIService: OpenAIService,
    @InjectRepository(AIResult)
    private readonly aiResultRepository: Repository<AIResult>,
  ) {}

  async create(data: Partial<Ticket>,userId: number) {
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

    return savedTicket;
  }

  findAll() {
    return this.ticketRepository.find({
      relations: ['user', 'ai_results'],
    });
  }

  findAllForUser(userId: number) {
    return this.ticketRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'ai_results'],
    });
  }

  findOne(id: string) {
    return this.ticketRepository.findOne({ where: { id: parseInt(id) }, relations: ['user'] });
  }

  update(id: string, data: Partial<Ticket>) {
    return this.ticketRepository.update(id, data);
  }

  remove(id: string) {
    return this.ticketRepository.delete(id);
  }
}
