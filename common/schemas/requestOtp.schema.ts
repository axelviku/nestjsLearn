import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OTP_TYPE } from 'common/enums';

export type RequestOtpDocument = RequestOtp & Document;

@Schema({ timestamps: true })
export class RequestOtp {
  @Prop({ type: String, lowercase: true })
  userRole: string; // client/interpreter

  @Prop({ type: Number, required: true })
  otp: number;

  @Prop({
    type: Object,
  })
  requestOtpType: {
    emailAddress: string;
    countryCode: string;
    phoneNumber: string;
  };

  @Prop({ type: String, enum: OTP_TYPE })
  otpType: string;

  @Prop({ type: Date })
  otpValidTillDate: Date;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Number, max: 5, default: 1 })
  resendOtpCounter: number;

  @Prop({ type: Boolean, default: false })
  isOtpDeliver: boolean;

  @Prop({ type: Date })
  otpBlockTillDate: Date;

  @Prop({ type: Date })
  lastUpdated: Date;

  @Prop({
    type: {
      os: String,
      version: String,
      language: String,
      deviceVersion: String,
      deviceName: String,
      lastConnectedDate: Date,
      timezone: String,
    },
  })
  deviceInfo: {
    os: string;
    version: string;
    language: string;
    deviceVersion: string;
    deviceName: string;
    lastConnectedDate: Date;
    timezone: string;
  };

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RequestOtpSchema = SchemaFactory.createForClass(RequestOtp);
