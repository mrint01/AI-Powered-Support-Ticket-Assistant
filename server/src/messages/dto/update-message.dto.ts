import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content must not be empty' })
  @MaxLength(10000, { message: 'Content must not exceed 10000 characters' })
  content: string;
}

