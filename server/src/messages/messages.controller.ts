import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, UpdateMessageDto } from './dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('ticket/:ticketId')
  async getMessagesByTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Query('includeInternal', new DefaultValuePipe(false), ParseBoolPipe)
    includeInternal: boolean,
  ) {
    return await this.messagesService.getMessagesByTicketId(ticketId, includeInternal);
  }

  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.messagesService.createMessage(
      createMessageDto.ticketId,
      createMessageDto.senderId,
      createMessageDto.content,
      createMessageDto.type,
      createMessageDto.isInternal || false,
    );
  }

  @Put(':id')
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return await this.messagesService.updateMessage(id, updateMessageDto.content);
  }

  @Delete(':id')
  async deleteMessage(@Param('id', ParseIntPipe) id: number) {
    await this.messagesService.deleteMessage(id);
    return { message: 'Message deleted successfully' };
  }
} 