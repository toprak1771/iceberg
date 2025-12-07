import { HttpException, Injectable } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { TransactionDocument } from './schema/transaction.schema';
import {
  UpdateTransactionDto,
  StageEnum,
} from './dto/update.stage.transaction.dto';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { CommissionService } from '../commission/commission.service';
import { CommissionDocument } from '../commission/schema/commission.schema';
import { TransactionHistoryEntry } from './types/transaction-history.type';
import { AgentsService } from '../agents/agents.service';
import { AddAgentDto } from './dto/add.agent.dto';
import { FinancialBreakdownItem } from './types/financial-breakdown.type';
@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly commissionService: CommissionService,
    private readonly agentsService: AgentsService,
  ) {}

  async create(data: CreateTransactionDto): Promise<TransactionDocument> {
    return this.transactionsRepository.create(data);
  }

  async findAll(): Promise<TransactionDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await this.transactionsRepository.findAll();
  }

  async findById(id: string): Promise<TransactionDocument | null> {
    return await this.transactionsRepository.findById(id);
  }

  async changeStage(data: UpdateTransactionDto): Promise<TransactionDocument> {
    // Find transaction by id
    const transaction = await this.transactionsRepository.findById(data._id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Control stage transition
    const isValidTransition = this.controlStage(data.stage, transaction.stage);
    if (!isValidTransition) {
      throw new HttpException(
        `Invalid stage transition from ${transaction.stage} to ${data.stage}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Change stage
    let updatedTransaction =
      await this.transactionsRepository.changeStage(data);

    // Add transaction History
    const transactionWithHistory = await this.addTransactionHistory({
      _id: data._id,
      type: 'ChangeStage',
      payload: {
        details: `Transitioned from ${transaction.stage} to ${data.stage} at ${new Date().toISOString()}`,
      },
    });
    if (transactionWithHistory) {
      updatedTransaction = transactionWithHistory;
    }

    if (!updatedTransaction) {
      throw new NotFoundException('Transaction not found after stage update');
    }

    // If transitioning to completed, calculate commission
    if (data.stage === StageEnum.completed) {
      const commission = await this.calculateCommission(updatedTransaction);

      // Get agent details for transaction history
      const agentsData: Array<{
        id: string;
        name: string;
        surname: string;
        email: string;
        phone: string;
        amount: number;
        role: 'listing' | 'selling';
      }> = [];
      if (commission && commission.agents && commission.agents.length > 0) {
        for (const commissionAgent of commission.agents) {
          const agent = await this.agentsService.findById(
            commissionAgent.agentId.toString(),
          );
          if (agent) {
            agentsData.push({
              id: agent._id.toString(),
              name: agent.name,
              surname: agent.surname,
              email: agent.email,
              phone: agent.phone,
              amount: commissionAgent.amount,
              role: commissionAgent.role,
            });
          }
        }
      }

      // Add transaction history for commission calculation with agent details
      const transactionWithCommissionHistory = await this.addTransactionHistory(
        {
          _id: data._id,
          type: 'CommissionCalculation',
          payload: {
            details: `Commission calculated for ${data.stage} at ${new Date().toISOString()}`,
            agencyAmount: commission?.agencyAmount || 0,
            agents: agentsData,
          },
        },
      );
      if (transactionWithCommissionHistory) {
        updatedTransaction = transactionWithCommissionHistory;
      }

      // Add total vesting to agents
      for (const agent of agentsData) {
        await this.agentsService.addTotalVesting(agent.id, agent.amount);
      }
    }

    if (!updatedTransaction) {
      throw new NotFoundException('Transaction not found after update');
    }

    return updatedTransaction;
  }

  async addAgent(data: AddAgentDto): Promise<TransactionDocument> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const updated = (await this.transactionsRepository.addAgent(
      data,
    )) as TransactionDocument | null;
    if (!updated) {
      throw new NotFoundException('Transaction not found to add agent');
    }
    return updated;
  }

  async financialBreakdown(): Promise<FinancialBreakdownItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await this.transactionsRepository.financialBreakdown();
  }

  async findTransactionHistoryById(
    id: string,
  ): Promise<TransactionHistoryEntry[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await this.transactionsRepository.findTransactionHistoryById(id);
  }

  controlStage(stage: string, previousStage: string): boolean {
    // Stage order: agreement (0) -> earnest_money (1) -> title_deed (2) -> completed (3)
    const stageOrder: Record<string, number> = {
      agreement: 0,
      earnest_money: 1,
      title_deed: 2,
      completed: 3,
    };

    // If previousStage is null/undefined (new transaction) -> only forward validation
    if (previousStage === null || previousStage === undefined) {
      return this.validateForwardTransition(stage, previousStage);
    }

    const currentOrder = stageOrder[previousStage];
    const newOrder = stageOrder[stage];

    // If stage not found, invalid
    if (currentOrder === undefined || newOrder === undefined) {
      return false;
    }

    // Cannot transition to the same stage
    if (currentOrder === newOrder) {
      return false;
    }

    // Backward transition - no validation, always allow
    if (newOrder < currentOrder) {
      return true;
    }

    // Forward transition - apply validation rules
    return this.validateForwardTransition(stage, previousStage);
  }

  private validateForwardTransition(
    stage: string,
    previousStage: string | null | undefined,
  ): boolean {
    switch (stage) {
      case 'agreement':
        // Can only transition to agreement from initial state
        return previousStage === null || previousStage === undefined;
      case 'earnest_money':
        // Can transition to earnest_money from agreement or initial state
        return (
          previousStage === 'agreement' ||
          previousStage === null ||
          previousStage === undefined
        );
      case 'title_deed':
        // Can only transition to title_deed from earnest_money
        return previousStage === 'earnest_money';
      case 'completed':
        // Can only transition to completed from title_deed
        return previousStage === 'title_deed';
      default:
        return false;
    }
  }

  private async calculateCommission(
    _transaction: TransactionDocument,
  ): Promise<CommissionDocument | null> {
    // Calculate commission - will be implemented later
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const commission = (await this.commissionService.calculateCommission(
      _transaction,
    )) as CommissionDocument | null;
    return commission;
  }

  private addTransactionHistory(data: {
    _id: string;
    type: TransactionHistoryEntry['type'];
    payload: TransactionHistoryEntry['payload'];
  }): Promise<TransactionDocument | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.transactionsRepository.addTransactionHistory(data);
  }
}
