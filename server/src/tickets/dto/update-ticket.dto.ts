import { IsString, IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';
import { TicketStatus, TicketPriority } from '../../entities/ticket.entity';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @IsEnum(TicketStatus, { message: 'Status must be one of: open, in progress, resolved, closed' })
  @IsOptional()
  status?: TicketStatus;

  @IsEnum(TicketPriority, { message: 'Priority must be one of: low, medium, high' })
  @IsOptional()
  priority?: TicketPriority;
}

