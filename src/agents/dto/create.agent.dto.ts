/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReferenceDto {
  @ApiPropertyOptional({
    description: 'Reference person name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Reference person surname',
    example: 'Smith',
  })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({
    description: 'Reference company name',
    example: 'Acme Corp',
  })
  @IsOptional()
  @IsString()
  company?: string;
}

export class CreateAgentDto {
  @ApiPropertyOptional({
    description: 'Agent ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  _id: string;

  @ApiProperty({
    description: 'Agent first name',
    example: 'Jane',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Agent surname',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  surname: string;

  @ApiPropertyOptional({
    description: 'Reference information',
    type: ReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenceDto)
  reference?: ReferenceDto;

  @ApiProperty({
    description: 'Agent email address',
    example: 'jane.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Agent phone number',
    example: '+1-202-555-0100',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Whether the agent is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the agent is deleted',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Total vesting amount',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  total_vesting?: number;

  @ApiPropertyOptional({
    description: 'Job start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  job_started_at?: Date;

  @ApiPropertyOptional({
    description: 'Job end date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  job_ended_at?: Date;
}
