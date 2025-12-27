import { IsInt, IsString, IsEnum, IsBoolean, IsNotEmpty, Min, MaxLength, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../../entities/message.entity';

export class CreateMessageDto {
  @Type(() => Number)
  @IsInt({ message: 'Ticket ID must be a valid integer' })
  @Min(1, { message: 'Ticket ID must be a positive integer' })
  @IsNotEmpty({ message: 'Ticket ID is required' })
  ticketId: number;

  @Type(() => Number)
  @IsInt({ message: 'Sender ID must be a valid integer' })
  @Min(1, { message: 'Sender ID must be a positive integer' })
  @IsNotEmpty({ message: 'Sender ID is required' })
  senderId: number;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content must not be empty' })
  @MaxLength(10000, { message: 'Content must not exceed 10000 characters' })
  content: string;

  @IsEnum(MessageType, { message: 'Type must be one of: client, admin, system' })
  @IsNotEmpty({ message: 'Type is required' })
  type: MessageType;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}

