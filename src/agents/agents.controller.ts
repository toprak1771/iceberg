import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create.agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  async create(@Body() dto: CreateAgentDto) {
    try {
      return await this.agentsService.create(dto);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create agent';
      throw new BadRequestException(message);
    }
  }

  @Get('all')
  async findAll(@Res() response: Response) {
    try {
      const agents = await this.agentsService.findAll();
      response.status(HttpStatus.OK).json(agents);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          error instanceof Error ? error.message : 'Failed to get all agents',
      });
    }
  }
}
