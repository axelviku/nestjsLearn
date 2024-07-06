import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ReferralCodeType } from './referralCodeType.schema';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class ReferralCode extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralCodeType' })
  codeType: ReferralCodeType;

  @Prop({ type: String, required: [true, "can't be blank"] })
  name: string;

  @Prop({
    type: String,
    unique: true,
    uppercase: true,
    required: [true, "can't be blank"],
  })
  referralCode: string;

  @Prop({ type: String, required: [true, "can't be blank"] })
  description: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"] }])
  assignedSpecificInterpreters: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  isCreditCardShown: boolean;

  @Prop({ type: Boolean, default: true })
  isCallRateShown: boolean;

  @Prop({ type: Boolean, default: false })
  isFreeCallApply: boolean;

  @Prop({ type: Boolean, default: false })
  isReferralAdmin: boolean;

  @Prop({
    type: {
      emailAddress: String,
      referralAdminId: { type: Types.ObjectId, ref: 'User' },
    },
  })
  referralAdminDetails: {
    emailAddress: string;
    referralAdminId: mongoose.Schema.Types.ObjectId;
  };

  @Prop({
    type:{
      allowedCallLimit: { type: Number, default: 0 },
      assignedFreeCallMinutes: { type: Number, default: 0 },
    }
    
  })
  freeCallConditions: {
    allowedCallLimit: number;
    assignedFreeCallMinutes: number;
  };

  @Prop({
    type:{
      referralDiscountPercentage: { type: Number, default: 0 },
      referralAdminRevenuePercentage: { type: Number, default: 5 },
      oyraaEarningPercentage: { type: Number, default: 35 },
      interpreterEarningPercentage: { type: Number, default: 60 },
    }
  })
  callingPriceCalculation: {
    referralDiscountPercentage: number;
    referralAdminRevenuePercentage: number;
    oyraaEarningPercentage: number;
    interpreterEarningPercentage: number;
  };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ReferralCodeSchema = SchemaFactory.createForClass(ReferralCode);
