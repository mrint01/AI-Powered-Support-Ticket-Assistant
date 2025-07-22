import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('ai_results')
export class AIResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, { nullable: false })
  ticket: Ticket;

  @Column('text', { nullable: true })
  summary: string;

  @Column({ type: 'enum', enum: PriorityLevel, nullable: true })
  priority: PriorityLevel;

  @Column('text', { nullable: true })
  suggested_response: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 