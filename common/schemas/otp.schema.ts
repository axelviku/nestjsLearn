import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OTP_TYPE } from 'common/enums';

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' }, })
export class Otp extends Document {
  @Prop({ type: String, required: true, enum: [ OTP_TYPE.SIGN_UP, OTP_TYPE.FORGOT_PASSWORD] })
  type: string;

  @Prop({ type: String, required: true, enum: [  ] }) 
  userType: string;

  @Prop({ type: String, trim: true })
  email?: string; // Optional email

  @Prop({ type: String, default: '+1' })
  countryCode: string;

  @Prop({ type: String, trim: true })
  mobile?: string; // Optional phone number

  @Prop({ type: String, trim: true })
  formattedPhone?: string; // Optional formatted phone number

  @Prop({ type: String, trim: true, required: true })
  otp: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Date })
  validTill?: Date; // Optional expiration date
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
