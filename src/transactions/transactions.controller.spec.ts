/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { CommissionService } from '../commission/commission.service';
import { AgentsService } from '../agents/agents.service';
import { PdfService } from '../services/pdf.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const transactionsRepositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    changeStage: jest.fn(),
    addTransactionHistory: jest.fn(),
    addAgent: jest.fn(),
    financialBreakdown: jest.fn(),
    findTransactionHistoryById: jest.fn(),
  };

  const commissionServiceMock = {
    calculateCommission: jest.fn(),
    create: jest.fn(),
  };

  const agentsServiceMock = {
    findById: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    addTotalVesting: jest.fn(),
  };

  const pdfServiceMock = {
    generateFinancialBreakdownPdf: jest.fn(),
    generateTransactionHistoryPdf: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        TransactionsService,
        { provide: TransactionsRepository, useValue: transactionsRepositoryMock },
        { provide: CommissionService, useValue: commissionServiceMock },
        { provide: AgentsService, useValue: agentsServiceMock },
        { provide: PdfService, useValue: pdfServiceMock },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
