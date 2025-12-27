import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageIdDto {
  @Type(() => Number)
  @IsInt({ message: 'Message ID must be a valid integer' })
  @Min(1, { message: 'Message ID must be a positive integer' })
  id: number;
}

export class TicketIdParamDto {
  @Type(() => Number)
  @IsInt({ message: 'Ticket ID must be a valid integer' })
  @Min(1, { message: 'Ticket ID must be a positive integer' })
  ticketId: number;
}

