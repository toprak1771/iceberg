import { Injectable } from '@nestjs/common';
import { AgentsRepository } from './agents.repository';
import { CreateAgentDto } from './dto/create.agent.dto';
import { AgentDocument } from './schema/agent.schema';

@Injectable()
export class AgentsService {
  constructor(private readonly agentsRepository: AgentsRepository) {}

  async create(data: CreateAgentDto): Promise<AgentDocument> {
    return this.agentsRepository.create(data);
  }
}
