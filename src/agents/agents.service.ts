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

  async findAll(): Promise<AgentDocument[]> {
    return this.agentsRepository.findAll();
  }

  async findById(id: string): Promise<AgentDocument | null> {
    return this.agentsRepository.findById(id);
  }

  async addTotalVesting(
    id: string,
    amount: number,
  ): Promise<AgentDocument | null> {
    return this.agentsRepository.addTotalVesting(id, amount);
  }
}
