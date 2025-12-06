import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Agent } from '../../agents/schema/agent.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Transaction {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: '' })
  description: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false, default: false })
  isDeleted?: boolean = false;

  @Prop({
    required: true,
    default: '',
    enum: ['agreement', 'earnest_money', 'title_deed', 'completed'],
  })
  stage: string;

  @Prop({ required: true, default: 0 })
  total_fee: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Agent.name }],
    default: [],
  })
  listing_agents?: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: Agent.name }],
    default: [],
  })
  selling_agents?: Types.ObjectId[];
}

export const transactionSchema = SchemaFactory.createForClass(Transaction);
