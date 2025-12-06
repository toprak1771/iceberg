import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument } from './schema/commission.schema';

@Injectable()
export class CommissionRepository {
  constructor(
    @InjectModel(Commission.name)
    private readonly commissionModel: Model<CommissionDocument>,
  ) {}

  async create(data: Partial<Commission>): Promise<CommissionDocument> {
    const created = new this.commissionModel(data);
    return created.save();
  }
}
