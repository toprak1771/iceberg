import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { Transaction, transactionSchema } from './schema/transaction.schema';
import { CommissionModule } from '../commission/commission.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: transactionSchema },
    ]),
    CommissionModule,
    AgentsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
