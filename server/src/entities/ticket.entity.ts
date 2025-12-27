import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { AIResult } from './ai_result.entity';
import { Message } from './message.entity';

export enum TicketStatus {
  Open = 'open',
  IN_PROGRESS = 'in progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  user: User | null;

  @OneToMany(() => AIResult, aiResult => aiResult.ticket)
  ai_results: AIResult[];

  @OneToMany(() => Message, message => message.ticket)
  messages: Message[];

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'simple-enum', enum: TicketStatus, default: TicketStatus.Open })
  status: TicketStatus;

  @Column({ type: 'simple-enum', enum: TicketPriority, default: TicketPriority.LOW })
  priority: TicketPriority;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
