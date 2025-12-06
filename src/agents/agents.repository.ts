import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAgentDto } from './dto/create.agent.dto';
import { Agent, AgentDocument } from './schema/agent.schema';

@Injectable()
export class AgentsRepository {
  constructor(
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
  ) {}

  async create(data: CreateAgentDto): Promise<AgentDocument> {
    const created = new this.agentModel(data);
    return created.save();
  }
}
