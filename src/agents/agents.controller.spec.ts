import { Test, TestingModule } from '@nestjs/testing';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentsRepository } from './agents.repository';

describe('AgentsController', () => {
  let controller: AgentsController;

  const agentsRepositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    addTotalVesting: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        AgentsService,
        { provide: AgentsRepository, useValue: agentsRepositoryMock },
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
