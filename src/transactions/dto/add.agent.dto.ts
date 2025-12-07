/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AgentRoleEnum {
  listing = 'listing',
  selling = 'selling',
}

export class AddAgentDto {
  @ApiProperty({
    description: 'Transaction ID (MongoDB ObjectId)',
    example: '6934c32095082ae0c565a7e4',
  })
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @ApiProperty({
    description: 'Agent ID to add (MongoDB ObjectId)',
    example: '69358fba3705cf36b744ac3c',
  })
  @IsNotEmpty()
  @IsMongoId()
  agent_id: string;

  @ApiProperty({
    description: 'Agent role in the transaction',
    enum: AgentRoleEnum,
    example: AgentRoleEnum.selling,
  })
  @IsNotEmpty()
  @IsEnum(AgentRoleEnum)
  role: AgentRoleEnum;
}
