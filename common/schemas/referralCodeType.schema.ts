import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ReferralCodeType extends Document {
  @Prop({ type: String, required: [true, "can't be blank"] })
  name: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ReferralCodeTypeSchema =
  SchemaFactory.createForClass(ReferralCodeType);
