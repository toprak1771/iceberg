import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReferenceResponseDto {
  @ApiPropertyOptional({ example: 'John' })
  name?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  surname?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  company?: string;
}

export class AgentResponseDto {
  @ApiProperty({
    description: 'Agent ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({ example: 'Jane' })
  name: string;

  @ApiProperty({ example: 'Doe' })
  surname: string;

  @ApiPropertyOptional({ type: ReferenceResponseDto })
  reference?: ReferenceResponseDto;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({ example: '+1-202-555-0100' })
  phone: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: false })
  isDeleted?: boolean;

  @ApiPropertyOptional({ example: 0 })
  total_vesting?: number;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  job_started_at?: Date;

  @ApiPropertyOptional({ example: '2024-12-31T00:00:00.000Z' })
  job_ended_at?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated: Date;
}
