import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinancialBreakdownAgentDto {
  @ApiProperty({ example: '6934c23c624e3563227bbad3' })
  agentId: string;

  @ApiProperty({ enum: ['listing', 'selling'], example: 'listing' })
  role: string;

  @ApiProperty({ example: 300 })
  amount: number;

  @ApiPropertyOptional({ example: 'Jane' })
  name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  surname?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  email?: string;
}

export class FinancialBreakdownCommissionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 600 })
  agencyAmount: number;

  @ApiProperty({ type: [FinancialBreakdownAgentDto] })
  agents: FinancialBreakdownAgentDto[];
}

export class FinancialBreakdownItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'Deal #1234' })
  name: string;

  @ApiProperty({ example: 'Downtown listing' })
  description: string;

  @ApiPropertyOptional({ type: FinancialBreakdownCommissionDto })
  commission?: FinancialBreakdownCommissionDto;
}
