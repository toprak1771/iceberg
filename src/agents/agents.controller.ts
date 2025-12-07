import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create.agent.dto';
import { AgentResponseDto } from './dto/agent.response.dto';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiCreatedResponse({
    description: 'Agent successfully created',
    type: AgentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation failed',
  })
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
  @ApiOperation({ summary: 'Get all agents' })
  @ApiOkResponse({
    description: 'List of all agents',
    type: [AgentResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Failed to retrieve agents',
  })
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
