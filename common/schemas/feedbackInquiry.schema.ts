import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';
export type FeedbackInquiryDocument = FeedbackInquiry & Document;

@Schema()
export class FeedbackInquiry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  to: string;

  @Prop({ type: String, required: true })
  comment: string;

  @Prop({ type: Object })
  deviceInfo: string;
}

export const FeedbackInquirySchema =
  SchemaFactory.createForClass(FeedbackInquiry);
