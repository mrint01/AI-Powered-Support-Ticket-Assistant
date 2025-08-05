import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageType } from '../entities/message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('ticket/:ticketId')
  async getMessagesByTicket(
    @Param('ticketId') ticketId: number,
    @Query('includeInternal') includeInternal: boolean = false,
  ) {
    return await this.messagesService.getMessagesByTicketId(ticketId, includeInternal);
  }

  @Post()
  async createMessage(
    @Body() body: {
      ticketId: number;
      senderId: number;
      content: string;
      type: MessageType;
      isInternal?: boolean;
    },
    @Request() req: any,
  ) {
    return await this.messagesService.createMessage(
      body.ticketId,
      body.senderId,
      body.content,
      body.type,
      body.isInternal || false,
    );
  }

  @Put(':id')
  async updateMessage(
    @Param('id') id: number,
    @Body() body: { content: string },
  ) {
    return await this.messagesService.updateMessage(id, body.content);
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: number) {
    await this.messagesService.deleteMessage(id);
    return { message: 'Message deleted successfully' };
  }
} 