import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { PdfService } from '../services/pdf.service';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { UpdateTransactionDto } from './dto/update.stage.transaction.dto';
import { AddAgentDto } from './dto/add.agent.dto';
import {
  TransactionResponseDto,
  TransactionHistoryResponseDto,
} from './dto/transaction.response.dto';
import { FinancialBreakdownItemDto } from './dto/financial-breakdown.response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiCreatedResponse({
    description: 'Transaction successfully created',
    type: TransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation failed',
  })
  async create(@Body() dto: CreateTransactionDto, @Res() response: Response) {
    try {
      const savedTransaction = await this.transactionsService.create(dto);
      response.status(HttpStatus.CREATED).json(savedTransaction);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create transaction',
      });
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiOkResponse({
    description: 'List of all transactions',
    type: [TransactionResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Failed to retrieve transactions',
  })
  async findAll(@Res() response: Response) {
    try {
      const transactions = await this.transactionsService.findAll();
      response.status(HttpStatus.OK).json(transactions);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get all transactions',
      });
    }
  }

  @Put('changeStage')
  @ApiOperation({ summary: 'Update transaction stage' })
  @ApiOkResponse({
    description: 'Transaction stage successfully updated',
    type: TransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - invalid stage transition',
  })
  async changeStage(
    @Body() dto: UpdateTransactionDto,
    @Res() response: Response,
  ) {
    try {
      const updatedTransaction =
        await this.transactionsService.changeStage(dto);
      response.status(HttpStatus.OK).json(updatedTransaction);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          error instanceof Error ? error.message : 'Failed to change stage',
      });
    }
  }

  @Post('addAgent')
  @ApiOperation({ summary: 'Add an agent to a transaction' })
  @ApiOkResponse({
    description: 'Agent successfully added to transaction',
    type: TransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation failed',
  })
  async addAgent(@Body() dto: AddAgentDto, @Res() response: Response) {
    try {
      const addedAgent = await this.transactionsService.addAgent(dto);
      response.status(HttpStatus.OK).json(addedAgent);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message: error instanceof Error ? error.message : 'Failed to add agent',
      });
    }
  }

  @Get('financialBreakdown')
  @ApiOperation({
    summary: 'Get financial breakdown of completed transactions',
  })
  @ApiOkResponse({
    description: 'Financial breakdown data',
    type: [FinancialBreakdownItemDto],
  })
  @ApiBadRequestResponse({
    description: 'Failed to retrieve financial breakdown',
  })
  async financialBreakdown(@Res() response: Response) {
    try {
      const financialBreakdown =
        await this.transactionsService.financialBreakdown();
      response.status(HttpStatus.OK).json(financialBreakdown);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get financial breakdown',
      });
    }
  }

  @Get('financialBreakdown/pdf')
  @ApiOperation({ summary: 'Generate PDF report of financial breakdown' })
  @ApiOkResponse({
    description: 'PDF file generated successfully',
    content: {
      'application/pdf': {},
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate PDF',
  })
  async financialBreakdownPdf(@Res() response: Response) {
    try {
      const financialBreakdown =
        await this.transactionsService.financialBreakdown();
      const pdfBuffer =
        await this.pdfService.generateFinancialBreakdownPdf(financialBreakdown);

      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="financial-breakdown-${new Date().toISOString().split('T')[0]}.pdf"`,
      );
      response.send(pdfBuffer);
    } catch (error: unknown) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          error instanceof Error ? error.message : 'Failed to generate PDF',
      });
    }
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get transaction history by transaction ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID (MongoDB ObjectId)',
    example: '6934c32095082ae0c565a7e4',
  })
  @ApiOkResponse({
    description: 'Transaction history retrieved successfully',
    type: [TransactionHistoryResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Failed to retrieve transaction history',
  })
  async findTransactionHistoryById(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const history =
        await this.transactionsService.findTransactionHistoryById(id);
      response.status(HttpStatus.OK).json(history);
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get transaction history',
      });
    }
  }

  @Get(':id/history/pdf')
  @ApiOperation({ summary: 'Generate PDF report of transaction history' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID (MongoDB ObjectId)',
    example: '6934c32095082ae0c565a7e4',
  })
  @ApiOkResponse({
    description: 'PDF file generated successfully',
    content: {
      'application/pdf': {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate PDF',
  })
  async findTransactionHistoryPdf(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const transaction = await this.transactionsService.findById(id);
      if (!transaction) {
        response.status(HttpStatus.NOT_FOUND).json({
          message: 'Transaction not found',
        });
        return;
      }

      const history =
        await this.transactionsService.findTransactionHistoryById(id);
      const pdfBuffer = await this.pdfService.generateTransactionHistoryPdf(
        transaction._id.toString(),
        transaction.name || 'N/A',
        history,
      );

      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="transaction-history-${transaction._id.toString()}-${new Date().toISOString().split('T')[0]}.pdf"`,
      );
      response.send(pdfBuffer);
    } catch (error: unknown) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate transaction history PDF',
      });
    }
  }
}
