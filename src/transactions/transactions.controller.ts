import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { PdfService } from '../services/pdf.service';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { UpdateTransactionDto } from './dto/update.stage.transaction.dto';
import { AddAgentDto } from './dto/add.agent.dto';
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
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

  @Put('changeStage')
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
}
