import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReferenceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsString()
  company?: string;
}

export class CreateAgentDto {
  @IsOptional()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenceDto)
  reference?: ReferenceDto;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsNumber()
  total_vesting?: number;

  @IsOptional()
  @IsDate()
  job_started_at?: Date;

  @IsOptional()
  @IsDate()
  job_ended_at?: Date;
}
