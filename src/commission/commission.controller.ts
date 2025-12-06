import { Controller } from '@nestjs/common';
import { CommissionService } from './commission.service';

@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}
}
