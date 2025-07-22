import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  create(data: Partial<Ticket>) {
    const ticket = this.ticketRepository.create(data);
    return this.ticketRepository.save(ticket);
  }

  findAll() {
    return this.ticketRepository.find({ relations: ['user'] });
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
