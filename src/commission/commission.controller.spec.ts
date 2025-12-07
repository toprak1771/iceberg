import { Test, TestingModule } from '@nestjs/testing';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { CommissionRepository } from './commission.repository';

describe('CommissionController', () => {
  let controller: CommissionController;

  const commissionRepositoryMock = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionController],
      providers: [
        CommissionService,
        { provide: CommissionRepository, useValue: commissionRepositoryMock },
      ],
    }).compile();

    controller = module.get<CommissionController>(CommissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
