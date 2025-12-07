/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { CommissionService } from '../commission/commission.service';
import { AgentsService } from '../agents/agents.service';
import {
  StageEnum,
  UpdateTransactionDto,
} from './dto/update.stage.transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const transactionsRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    changeStage: jest.fn(),
    addTransactionHistory: jest.fn(),
    addAgent: jest.fn(),
  };

  const commissionServiceMock = {
    calculateCommission: jest.fn(),
  };

  const agentsServiceMock = {
    findById: jest.fn(),
    addTotalVesting: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: transactionsRepositoryMock,
        },
        { provide: CommissionService, useValue: commissionServiceMock },
        { provide: AgentsService, useValue: agentsServiceMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('controlStage', () => {
    it('allows valid forward transitions', () => {
      expect(
        service.controlStage(StageEnum.earnest_money, StageEnum.agreement),
      ).toBe(true);
      expect(
        service.controlStage(StageEnum.completed, StageEnum.title_deed),
      ).toBe(true);
    });

    it('allows backward transitions', () => {
      expect(
        service.controlStage(StageEnum.earnest_money, StageEnum.title_deed),
      ).toBe(true);
    });

    it('rejects invalid or same-stage transitions', () => {
      expect(
        service.controlStage(StageEnum.title_deed, StageEnum.agreement),
      ).toBe(false);
      expect(
        service.controlStage(StageEnum.agreement, StageEnum.agreement),
      ).toBe(false);
      expect(
        service.controlStage('unknown' as StageEnum, StageEnum.agreement),
      ).toBe(false);
    });
  });

  describe('changeStage', () => {
    const baseTransaction: any = {
      _id: 'tx1',
      stage: StageEnum.agreement,
      listing_agents: [],
      selling_agents: [],
      total_fee: 100,
    } as any;

    it('throws NotFoundException when transaction is missing', async () => {
      transactionsRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.changeStage({
          _id: 'missing',
          stage: StageEnum.agreement,
        } as UpdateTransactionDto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws HttpException for invalid transition', async () => {
      transactionsRepositoryMock.findById.mockResolvedValue(baseTransaction);
      transactionsRepositoryMock.changeStage.mockResolvedValue(baseTransaction);
      transactionsRepositoryMock.addTransactionHistory.mockResolvedValue(
        baseTransaction,
      );

      await expect(
        service.changeStage({
          _id: 'tx1',
          stage: StageEnum.agreement,
        } as UpdateTransactionDto),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('calls commission and agent vesting when completing', async () => {
      const txBefore = { ...baseTransaction, stage: StageEnum.title_deed };
      const txAfter = { ...txBefore, stage: StageEnum.completed };
      const commissionResult = {
        agencyAmount: 50,
        agents: [{ agentId: 'a1', amount: 25, role: 'listing' as const }],
      };
      const agentDoc = {
        _id: { toString: () => 'a1' },
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '123',
      };

      transactionsRepositoryMock.findById.mockResolvedValue(txBefore);
      transactionsRepositoryMock.changeStage.mockResolvedValue(txAfter);
      transactionsRepositoryMock.addTransactionHistory.mockResolvedValue(
        txAfter,
      );
      commissionServiceMock.calculateCommission.mockResolvedValue(
        commissionResult,
      );
      agentsServiceMock.findById.mockResolvedValue(agentDoc);
      agentsServiceMock.addTotalVesting.mockResolvedValue(null);

      const result = await service.changeStage({
        _id: 'tx1',
        stage: StageEnum.completed,
      } as UpdateTransactionDto);

      expect(result).toBe(txAfter);
      expect(commissionServiceMock.calculateCommission).toHaveBeenCalledWith(
        txAfter,
      );
      expect(agentsServiceMock.findById).toHaveBeenCalledWith('a1');
      expect(agentsServiceMock.addTotalVesting).toHaveBeenCalledWith('a1', 25);
    });
  });
});
