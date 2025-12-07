import { Injectable } from '@nestjs/common';
import { CommissionRepository } from './commission.repository';
import { CommissionDocument } from './schema/commission.schema';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { TransactionDocument } from '../transactions/schema/transaction.schema';

@Injectable()
export class CommissionService {
  constructor(private readonly commissionRepository: CommissionRepository) {}

  async create(data: CreateCommissionDto): Promise<CommissionDocument> {
    return this.commissionRepository.create(data);
  }


  async calculateCommission(
    _transaction: TransactionDocument,
  ): Promise<CommissionDocument | null> {
    // Calculate commission
    // Get unique agent IDs (combines listing and selling agents, removes duplicates)
    const listingAgents = _transaction.listing_agents || [];
    const sellingAgents = _transaction.selling_agents || [];
    const setAgentIds = new Set([...listingAgents, ...sellingAgents]);
    const agentIds = Array.from(setAgentIds); // Convert Set to Array to use IDs
    const agentsCount = agentIds.length;

    let agencyAmount: number;
    let agents: Array<{
      agentId: string;
      role: 'listing' | 'selling';
      amount: number;
    }> = [];

    // If no agents, agency gets 100% of the commission
    if (agentsCount === 0) {
      agencyAmount = _transaction.total_fee;
      agents = [];
    } else {
      // If agents exist: 50% agency, 50% distributed among agents
      agencyAmount = _transaction.total_fee / 2;
      const agentsTotalAmount = _transaction.total_fee - agencyAmount;
      const eachAgentAmount = agentsTotalAmount / agentsCount;

      // Map listing agents to commission agent objects
      const commissionListingAgentsArray = listingAgents.map((agent) => ({
        agentId: agent.toString(), // Convert ObjectId to string for DTO
        role: 'listing' as const,
        amount: eachAgentAmount,
      }));

      // Map selling agents to commission agent objects
      const commissionSellingAgentsArray = sellingAgents.map((agent) => ({
        agentId: agent.toString(), // Convert ObjectId to string for DTO
        role: 'selling' as const,
        amount: eachAgentAmount,
      }));

      agents = [
        ...commissionListingAgentsArray,
        ...commissionSellingAgentsArray,
      ];
    }

    const commission = await this.commissionRepository.create({
      transactionId: _transaction._id.toString(), // Add transactionId (required by DTO)
      agencyAmount: agencyAmount,
      agents: agents,
    });

    return commission;
  }
}
