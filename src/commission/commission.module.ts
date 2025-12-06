import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { Commission, commissionSchema } from './schema/commission.schema';
import { CommissionRepository } from './commission.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: commissionSchema },
    ]),
  ],
  controllers: [CommissionController],
  providers: [CommissionService, CommissionRepository],
})
export class CommissionModule {}
