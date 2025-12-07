import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CommissionAgentDto {
  @IsMongoId()
  @IsNotEmpty()
  agentId: string;

  @IsEnum(['listing', 'selling'])
  role: 'listing' | 'selling';

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class CreateCommissionDto {
  @IsMongoId()
  @IsNotEmpty()
  transactionId: string;

  @IsNumber()
  @IsNotEmpty()
  agencyAmount: number;

  @IsOptional()
  @IsArray()
  agents?: CommissionAgentDto[];
}

