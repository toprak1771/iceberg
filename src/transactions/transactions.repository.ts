import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { TransactionHistoryEntry } from './types/transaction-history.type';
import { AddAgentDto } from './dto/add.agent.dto';
import { AgentRoleEnum } from './dto/add.agent.dto';
import { StageEnum } from './dto/update.stage.transaction.dto';
import { FinancialBreakdownItem } from './types/financial-breakdown.type';
@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async create(data: CreateTransactionDto): Promise<TransactionDocument> {
    const created = new this.transactionModel(data);
    return created.save();
  }

  async findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel.find();
  }

  async changeStage(data: {
    _id: string;
    stage: string;
  }): Promise<TransactionDocument | null> {
    // First, get the current transaction to save the current stage as previousStage
    const currentTransaction = await this.transactionModel.findById(data._id);
    if (!currentTransaction) {
      return null;
    }

    const currentStage = currentTransaction.stage || null;

    // Update both stage and previousStage
    const updatedTransaction = (await this.transactionModel.findByIdAndUpdate(
      data._id,
      { stage: data.stage, previousStage: currentStage },
      { new: true },
    )) as TransactionDocument;
    return updatedTransaction;
  }

  async findById(id: string): Promise<TransactionDocument | null> {
    const transaction = await this.transactionModel.findById(id);
    if (transaction) {
      return transaction;
    }
    return null;
  }

  async addAgent(data: AddAgentDto): Promise<TransactionDocument | null> {
    const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
      data._id,
      { $push: data.role == AgentRoleEnum.listing ? { listing_agents: data.agent_id } : { selling_agents: data.agent_id } },
      { new: true },
    );
    return updatedTransaction;
  }

  async addTransactionHistory(data: {
    _id: string;
    type: TransactionHistoryEntry['type'];
    payload: TransactionHistoryEntry['payload'];
  }): Promise<TransactionDocument | null> {
    const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
      data._id,
      {
        $push: {
          transactionHistory: {
            type: data.type,
            payload: data.payload,
            createdAt: new Date(),
          },
        },
        isActive: false,
      },
      { new: true },
    );
    if (updatedTransaction) {
      return updatedTransaction;
    }
    return null;
  }

  async financialBreakdown(): Promise<FinancialBreakdownItem[]> {
    const transactions = await this.transactionModel.aggregate([
      { $match: { stage: StageEnum.completed } },
      {
        $addFields: {
          transactionIdString: { $toString: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'commissions',
          localField: 'transactionIdString',
          foreignField: 'transactionId',
          as: 'commission',
        },
      },
      { $unwind: { path: '$commission', preserveNullAndEmptyArrays: true } },
      {
        $unwind: {
          path: '$commission.agents',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'commission.agents.agentId',
          foreignField: '_id',
          as: 'agentInfo',
        },
      },
      {
        $unwind: {
          path: '$agentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          commission: {
            $first: {
              _id: '$commission._id',
              agencyAmount: '$commission.agencyAmount',
            },
          },
          agents: {
            $push: {
              $cond: {
                if: { $ne: ['$commission.agents', null] },
                then: {
                  agentId: '$commission.agents.agentId',
                  role: '$commission.agents.role',
                  amount: '$commission.agents.amount',
                  name: '$agentInfo.name',
                  surname: '$agentInfo.surname',
                  email: '$agentInfo.email',
                },
                else: '$$REMOVE',
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          commission: {
            _id: '$commission._id',
            agencyAmount: '$commission.agencyAmount',
            agents: {
              $cond: {
                if: { $eq: [{ $size: '$agents' }, 0] },
                then: null,
                else: '$agents',
              },
            },
          },
        },
      },
    ]);
    return transactions as FinancialBreakdownItem[];
  }

  async findTransactionHistoryById(
    id: string,
  ): Promise<TransactionHistoryEntry[]> {
    const transaction = await this.transactionModel.findById(id);
    if (transaction && transaction.transactionHistory) {
      return transaction.transactionHistory;
    }
    return [];
  }
}
