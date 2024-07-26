import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRoleDocument = UserRole & Document;

class Permissions {
  @Prop({ type: Boolean, default: true })
  audioCall: boolean;

  @Prop({ type: Boolean, default: true })
  videoCall: boolean;

  @Prop({ type: Boolean, default: true })
  threewayCall: boolean;

  @Prop({ type: Boolean, default: true })
  messages: boolean;

  @Prop({ type: Boolean, default: true })
  broadcastRequest: boolean;

  @Prop({ type: Boolean, default: true })
  quickPay: boolean;

  @Prop({ type: Boolean, default: true })
  cardRegistration: boolean;

  @Prop({ type: Boolean, default: true })
  callHistory: boolean;

  @Prop({ type: Boolean, default: true })
  transactionHistory: boolean;

  @Prop({ type: Boolean, default: false })
  otpVerifyRequest: boolean;
}

@Schema({ timestamps: true })
export class UserRole {
  @Prop({ required: [true, "can't be blank"] })
  name: string;

  @Prop({ required: [true, "can't be blank"], unique: true, lowercase: true })
  slug: string;

  @Prop({ type: Permissions })
  permissions: Permissions;

  @Prop()
  description: string;

  @Prop({ default: false })
  isActive: boolean;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
