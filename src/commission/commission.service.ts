import { Injectable } from '@nestjs/common';
import { CommissionRepository } from './commission.repository';
import { CommissionDocument } from './schema/commission.schema';
import { CreateCommissionDto } from './dto/create-commission.dto';

@Injectable()
export class CommissionService {
  constructor(private readonly commissionRepository: CommissionRepository) {}

  async create(data: CreateCommissionDto): Promise<CommissionDocument> {
    return this.commissionRepository.create(data);
  }
}
