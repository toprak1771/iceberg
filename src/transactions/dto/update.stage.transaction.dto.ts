import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export enum StageEnum {
  agreement = 'agreement',
  earnest_money = 'earnest_money',
  title_deed = 'title_deed',
  completed = 'completed',
}

export class UpdateTransactionDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  @IsEnum(StageEnum)
  stage: StageEnum;
}
