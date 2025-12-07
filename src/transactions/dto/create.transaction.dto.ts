/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StageEnum {
  agreement = 'agreement',
  earnest_money = 'earnest_money',
  title_deed = 'title_deed',
  completed = 'completed',
}

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: 'Transaction ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  _id: string;

  @ApiProperty({
    description: 'Transaction name',
    example: 'Deal #1234',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Downtown listing',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Whether the transaction is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the transaction is deleted',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({
    description: 'Transaction stage',
    enum: StageEnum,
    example: StageEnum.agreement,
  })
  @IsNotEmpty()
  @IsEnum(StageEnum)
  stage: StageEnum;

  @ApiPropertyOptional({
    description: 'Total transaction fee',
    example: 120000,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  total_fee: number;

  @ApiPropertyOptional({
    description: 'Array of listing agent IDs',
    type: [String],
    example: ['6934c23c624e3563227bbad3'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  listing_agents: string[];

  @ApiPropertyOptional({
    description: 'Array of selling agent IDs',
    type: [String],
    example: ['69358fba3705cf36b744ac3c'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  selling_agents: string[];
}
