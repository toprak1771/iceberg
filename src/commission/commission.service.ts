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
      agencyAmount = _transaction.total_fee / 2;
      const agentsTotalAmount = _transaction.total_fee - agencyAmount;

      const hasListing = listingAgents.length > 0;
      const hasSelling = sellingAgents.length > 0;

      if (agentIds.length === 1) {
        const agentId = agentIds[0].toString();
        if (hasListing && hasSelling) {
          agents = [
            { agentId, role: 'listing', amount: agentsTotalAmount / 2 },
            { agentId, role: 'selling', amount: agentsTotalAmount / 2 },
          ];
        } else {
          agents = [
            {
              agentId,
              role: hasListing ? 'listing' : 'selling',
              amount: agentsTotalAmount,
            },
          ];
        }
      } else {
        const uniqueCount = agentIds.length;
        const eachAgentAmount = agentsTotalAmount / uniqueCount;

        const pickRole = (id: string): 'listing' | 'selling' =>
          listingAgents.some((a) => a.toString() === id)
            ? 'listing'
            : 'selling';

        agents = agentIds.map((id) => ({
          agentId: id.toString(),
          role: pickRole(id.toString()),
          amount: eachAgentAmount,
        }));
      }
    }

    const commission = await this.commissionRepository.create({
      transactionId: _transaction._id.toString(), // Add transactionId (required by DTO)
      agencyAmount: agencyAmount,
      agents: agents,
    });

    return commission;
  }
}
