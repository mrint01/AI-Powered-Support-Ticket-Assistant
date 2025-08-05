import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Ticket } from './ticket.entity';

export enum MessageType {
  CLIENT = 'client',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User | null;

  @Column({ name: 'sender_id', nullable: true })
  senderId: number | null;

  @Column({ type: 'enum', enum: MessageType })
  type: MessageType;

  @Column('text')
  content: string;

  @Column({ type: 'boolean', default: false })
  isInternal: boolean; // For admin-only notes

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 