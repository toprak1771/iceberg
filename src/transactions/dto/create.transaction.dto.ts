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

export enum StageEnum {
  agreement = 'agreement',
  earnest_money = 'earnest_money',
  title_deed = 'title_deed',
  completed = 'completed',
}

export class CreateTransactionDto {
  @IsOptional()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsNotEmpty()
  @IsEnum(StageEnum)
  stage: StageEnum;

  @IsOptional()
  @IsNumber()
  total_fee: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  listing_agents: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  selling_agents: string[];
}
