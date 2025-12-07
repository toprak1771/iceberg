/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export enum AgentRoleEnum {
  listing = 'listing',
  selling = 'selling',
}

export class AddAgentDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  @IsMongoId()
  agent_id: string;

  @IsNotEmpty()
  @IsEnum(AgentRoleEnum)
  role: AgentRoleEnum;
}
