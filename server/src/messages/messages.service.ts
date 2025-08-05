import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from '../entities/message.entity';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createMessage(
    ticketId: number,
    senderId: number | null,
    content: string,
    type: MessageType,
    isInternal: boolean = false,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      ticketId,
      senderId,
      content,
      type,
      isInternal,
    });

    return await this.messagesRepository.save(message);
  }

  async getMessagesByTicketId(ticketId: number, includeInternal: boolean = false): Promise<Message[]> {
    const query = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.ticketId = :ticketId', { ticketId })
      .orderBy('message.createdAt', 'ASC');

    if (!includeInternal) {
      query.andWhere('message.isInternal = :isInternal', { isInternal: false });
    }

    return await query.getMany();
  }

  async getLatestMessage(ticketId: number): Promise<Message | null> {
    return await this.messagesRepository.findOne({
      where: { ticketId },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.messagesRepository.delete(messageId);
  }

  async updateMessage(messageId: number, content: string): Promise<Message> {
    await this.messagesRepository.update(messageId, { content });
    return await this.messagesRepository.findOne({ where: { id: messageId } });
  }
} 