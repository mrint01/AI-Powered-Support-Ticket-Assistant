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
  ParseIntPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Request } from 'express';
import { CreateTicketDto, UpdateTicketDto } from './dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.ticketsService.create(createTicketDto, userId);
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id.toString());
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req: Request,
  ) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.ticketsService.update(id.toString(), updateTicketDto, userId);
  }

  @Get(':id/history')
  getTicketHistory(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getTicketHistory(id.toString());
  }

  @Get(':id/ai-suggestion')
  async getAISuggestion(@Param('id', ParseIntPipe) id: number) {
    const suggestion = await this.ticketsService.getAISuggestedResponse(id.toString());
    return suggestion ? { suggested_response: suggestion } : { suggested_response: null };
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id.toString());
  }
}
