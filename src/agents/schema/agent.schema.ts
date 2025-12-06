import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({
    required: false,
    type: {
      name: { type: String },
      surname: { type: String },
      company: { type: String },
    },
  })
  reference?: {
    name?: string;
    surname?: string;
    company?: string;
  };

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false, default: false })
  isDeleted?: boolean = false;

  @Prop({ required: false, default: 0 })
  total_vesting?: number = 0;

  @Prop({ required: false })
  job_started_at?: Date;

  @Prop({ required: false })
  job_ended_at?: Date;
}

export const agentSchema = SchemaFactory.createForClass(Agent);
