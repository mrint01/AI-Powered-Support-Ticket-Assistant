import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TicketIdDto {
  @Type(() => Number)
  @IsInt({ message: 'Ticket ID must be a valid integer' })
  @Min(1, { message: 'Ticket ID must be a positive integer' })
  id: number;
}

