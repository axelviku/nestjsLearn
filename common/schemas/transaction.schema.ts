import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  gateway: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, default: 'USD' })
  currency: string;

  @Prop({ type: String })
  sourceId?: string;

  @Prop({ type: String })
  clientSecret?: string;

  @Prop({ type: String })
  paymentId?: string;

  @Prop({ type: String })
  status?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Call' })
  callId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  consumptionTaxAmount: number;

  @Prop({ type: Number, default: 0 })
  serviceFeeAmount: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
