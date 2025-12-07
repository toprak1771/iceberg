import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { TransactionHistoryEntry } from './types/transaction-history.type';
import { AddAgentDto } from './dto/add.agent.dto';
import { AgentRoleEnum } from './dto/add.agent.dto';
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

  async changeStage(data: {
    _id: string;
    stage: string;
  }): Promise<TransactionDocument | null> {
    const updatedTransaction = (await this.transactionModel.findByIdAndUpdate(
      data._id,
      { stage: data.stage },
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
}
