import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';

@Entity('ticket_status_history')
export class TicketStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, { nullable: false })
  ticket: Ticket;

  @Column({ name: 'old_status', type: 'text' })
  oldStatus: string;

  @Column({ name: 'new_status', type: 'text' })
  newStatus: string;

  @ManyToOne(() => User, { nullable: false })
  changedBy: User;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
} 