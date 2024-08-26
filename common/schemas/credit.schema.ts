import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Credit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  transactionId?: Types.ObjectId;

  @Prop({ type: String })
  paymentId?: string;

  @Prop({ type: String })
  gateway?: string;

  @Prop({ type: Types.ObjectId, ref: 'Call' })
  callId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuickPay' })
  quickpayId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string; // credit or debit

  @Prop({ type: Number, required: true })
  credits: number;

  @Prop({ type: String, default: 'USD' })
  currency: string;

  @Prop({ type: String })
  status?: string;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
