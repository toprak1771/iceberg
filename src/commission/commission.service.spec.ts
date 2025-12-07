/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';
import { CommissionRepository } from './commission.repository';

describe('CommissionService', () => {
  let service: CommissionService;

  const commissionRepositoryMock = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        { provide: CommissionRepository, useValue: commissionRepositoryMock },
      ],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gives 100% to agency when no agents', async () => {
    const transaction: any = {
      _id: 'tx1',
      total_fee: 100,
      listing_agents: [],
      selling_agents: [],
    };
    const created = { agencyAmount: 100, agents: [], transactionId: 'tx1' };
    commissionRepositoryMock.create.mockResolvedValue(created);

    const result = await service.calculateCommission(transaction);

    expect(result).toEqual(created);
    expect(commissionRepositoryMock.create).toHaveBeenCalledWith({
      transactionId: 'tx1',
      agencyAmount: 100,
      agents: [],
    });
  });

  it('splits 50/50 between agency and agents (unique agents)', async () => {
    const transaction: any = {
      _id: 'tx2',
      total_fee: 200,
      listing_agents: ['a1'],
      selling_agents: ['a2'],
    };
    const created = {
      agencyAmount: 100,
      agents: [
        { agentId: 'a1', role: 'listing', amount: 50 },
        { agentId: 'a2', role: 'selling', amount: 50 },
      ],
      transactionId: 'tx2',
    };
    commissionRepositoryMock.create.mockResolvedValue(created);

    const result = await service.calculateCommission(transaction);

    expect(result).toEqual(created);
    expect(commissionRepositoryMock.create).toHaveBeenCalledWith({
      transactionId: 'tx2',
      agencyAmount: 100,
      agents: [
        { agentId: 'a1', role: 'listing', amount: 50 },
        { agentId: 'a2', role: 'selling', amount: 50 },
      ],
    });
  });

  it('same agent in both roles gets full agent portion (50%) split across roles)', async () => {
    const transaction: any = {
      _id: 'tx3',
      total_fee: 100,
      listing_agents: ['a1'],
      selling_agents: ['a1'], // same agent in both roles
    };
    const created = {
      agencyAmount: 50,
      agents: [
        { agentId: 'a1', role: 'listing', amount: 25 },
        { agentId: 'a1', role: 'selling', amount: 25 },
      ],
      transactionId: 'tx3',
    };
    commissionRepositoryMock.create.mockResolvedValue(created);

    const result = await service.calculateCommission(transaction);

    expect(commissionRepositoryMock.create).toHaveBeenCalledWith({
      transactionId: 'tx3',
      agencyAmount: 50,
      agents: [
        { agentId: 'a1', role: 'listing', amount: 25 },
        { agentId: 'a1', role: 'selling', amount: 25 },
      ],
    });
    expect(result).toEqual(created);
  });

  it('single agent single role gets full agent portion (50%)', async () => {
    const transaction: any = {
      _id: 'tx4',
      total_fee: 80,
      listing_agents: ['a1'],
      selling_agents: [],
    };
    const created = {
      agencyAmount: 40,
      agents: [{ agentId: 'a1', role: 'listing', amount: 40 }],
      transactionId: 'tx4',
    };
    commissionRepositoryMock.create.mockResolvedValue(created);

    const result = await service.calculateCommission(transaction);

    expect(commissionRepositoryMock.create).toHaveBeenCalledWith({
      transactionId: 'tx4',
      agencyAmount: 40,
      agents: [{ agentId: 'a1', role: 'listing', amount: 40 }],
    });
    expect(result).toEqual(created);
  });
});
