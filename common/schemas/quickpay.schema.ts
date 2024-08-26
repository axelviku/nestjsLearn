import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuickPay extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  interpreterId: Types.ObjectId;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number })
  fee: number;

  @Prop({ type: String, default: 'USD' })
  currency: string;

  @Prop({ type: Number, default: 0 })
  credits: number;

  @Prop({ type: String, default: 'USD' })
  creditsCurrency: string;

  @Prop({ type: Number, default: 0 })
  earning: number;

  @Prop({ type: String, default: 'USD' })
  earningCurrency: string;

  @Prop({ type: Number, default: 0 })
  share: number;

  @Prop({ type: String, default: 'USD' })
  shareCurrency: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'History' })
  conversionId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  consumptionTaxPercentage: number;

  @Prop({ type: Number, default: 0 })
  serviceFeePercentage: number;

  @Prop({ type: Number, default: 0 })
  consumptionTaxAmount: number;

  @Prop({ type: Number, default: 0 })
  serviceFeeAmount: number;

  @Prop({ type: Boolean, default: false })
  interpreterEmailSend: boolean;
}

export const QuickPaySchema = SchemaFactory.createForClass(QuickPay);
