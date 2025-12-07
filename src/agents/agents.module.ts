import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { Agent, agentSchema } from './schema/agent.schema';
import { AgentsRepository } from './agents.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Agent.name, schema: agentSchema }]),
  ],
  controllers: [AgentsController],
  providers: [AgentsService, AgentsRepository],
  exports: [AgentsService],
})
export class AgentsModule {}
