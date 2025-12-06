import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create.transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    try {
      return await this.transactionsService.create(dto);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create transaction';
      throw new BadRequestException(message);
    }
  }
}
