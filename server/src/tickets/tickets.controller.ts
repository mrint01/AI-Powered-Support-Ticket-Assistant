import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from '../entities/ticket.entity';
import { Request } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() data: Partial<Ticket>, @Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.ticketsService.create(data, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.session as any).userId;
    const userRole = (req.session as any).userRole;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    if (userRole === 'admin') {
      return this.ticketsService.findAll();
    } else {
      return this.ticketsService.findAllForUser(userId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Ticket>, @Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.ticketsService.update(id, data, userId);
  }

  @Get(':id/history')
  getTicketHistory(@Param('id') id: string) {
    return this.ticketsService.getTicketHistory(id);
  }

  @Get(':id/ai-suggestion')
  async getAISuggestion(@Param('id') id: string) {
    const suggestion = await this.ticketsService.getAISuggestedResponse(id);
    return suggestion ? { suggested_response: suggestion } : { suggested_response: null };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
