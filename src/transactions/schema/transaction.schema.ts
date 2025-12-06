import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { TransactionHistoryEntry } from '../types/transaction-history.type';
import { Agent } from '../../agents/schema/agent.schema';

const transactionHistorySchema = new MongooseSchema<TransactionHistoryEntry>(
  {
    type: {
      type: String,
      enum: [
        'ChangeStage',
        'AddListingAgent',
        'AddSellingAgent',
        'Payment',
        'Update',
      ],
      required: true,
    },
    payload: { type: MongooseSchema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

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

  @Prop({
    required: true,
    default: null,
    enum: ['agreement', 'earnest_money', 'title_deed', 'completed', null],
  })
  previousStage?: string;

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

  @Prop({ type: [transactionHistorySchema], default: [] })
  transactionHistory?: TransactionHistoryEntry[];
}

export const transactionSchema = SchemaFactory.createForClass(Transaction);
