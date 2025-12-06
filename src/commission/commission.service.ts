import { Injectable } from '@nestjs/common';
import { CommissionRepository } from './commission.repository';
import { CommissionDocument, Commission } from './schema/commission.schema';

@Injectable()
export class CommissionService {
  constructor(private readonly commissionRepository: CommissionRepository) {}

  async create(data: Partial<Commission>): Promise<CommissionDocument> {
    return this.commissionRepository.create(data);
  }
}
