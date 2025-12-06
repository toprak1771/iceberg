import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Agent } from '../../agents/schema/agent.schema';

export type CommissionDocument = HydratedDocument<Commission>;

@Schema({
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Commission {
  @Prop({ required: true, default: 0 })
  agencyAmount: number;

  @Prop({
    type: [
      {
        agentId: { type: Types.ObjectId, ref: Agent.name, required: true },
        role: {
          type: String,
          enum: ['listing', 'selling'],
          required: true,
        },
        amount: { type: Number, required: true, default: 0 },
      },
    ],
    default: [],
  })
  agents: Array<{
    agentId: Types.ObjectId;
    role: 'listing' | 'selling';
    amount: number;
  }>;
}

export const commissionSchema = SchemaFactory.createForClass(Commission);
