import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionHistoryResponseDto {
  @ApiProperty({
    enum: [
      'ChangeStage',
      'AddListingAgent',
      'AddSellingAgent',
      'Payment',
      'Update',
      'CommissionCalculation',
    ],
    example: 'ChangeStage',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'History entry payload',
    example: {
      details: 'Transitioned from agreement to earnest_money',
    },
  })
  payload?: Record<string, unknown>;

  @ApiProperty({ example: '2024-12-07T14:41:50.348Z' })
  createdAt: Date;
}

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({ example: 'Deal #1234' })
  name: string;

  @ApiProperty({ example: 'Downtown listing' })
  description: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: false })
  isDeleted?: boolean;

  @ApiProperty({
    enum: ['agreement', 'earnest_money', 'title_deed', 'completed'],
    example: 'agreement',
  })
  stage: string;

  @ApiPropertyOptional({ example: 120000 })
  total_fee?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['6934c23c624e3563227bbad3'],
  })
  listing_agents?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['69358fba3705cf36b744ac3c'],
  })
  selling_agents?: string[];

  @ApiPropertyOptional({
    type: [TransactionHistoryResponseDto],
  })
  transactionHistory?: TransactionHistoryResponseDto[];

  @ApiPropertyOptional({ example: null })
  previousStage?: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated: Date;
}
