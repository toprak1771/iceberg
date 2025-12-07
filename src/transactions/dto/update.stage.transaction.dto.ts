/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StageEnum {
  agreement = 'agreement',
  earnest_money = 'earnest_money',
  title_deed = 'title_deed',
  completed = 'completed',
}

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'Transaction ID (MongoDB ObjectId)',
    example: '6934c32095082ae0c565a7e4',
  })
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @ApiProperty({
    description: 'New transaction stage',
    enum: StageEnum,
    example: StageEnum.completed,
  })
  @IsNotEmpty()
  @IsEnum(StageEnum)
  stage: StageEnum;
}
