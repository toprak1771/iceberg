import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
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
}
