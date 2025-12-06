import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { TransactionDocument } from './schema/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async create(data: CreateTransactionDto): Promise<TransactionDocument> {
    return this.transactionsRepository.create(data);
  }
}
