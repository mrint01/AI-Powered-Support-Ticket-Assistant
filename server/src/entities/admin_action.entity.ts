import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';

@Entity('admin_actions')
export class AdminAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, { nullable: false })
  ticket: Ticket;

  @ManyToOne(() => User, { nullable: false })
  admin: User;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 