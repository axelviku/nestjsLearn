// user.schema.ts
import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { GENDER, CURRENCY } from 'common/enums';
import { ReferralCode } from './referralCode.schema';

// interface Account {
//   socialType: String;
//   socialId: String;
// }
export type UserDocument = User & Document;
@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class User extends Document {
  @Prop({ type: String, required: true, maxLength: 80 })
  fullName: String;

  @Prop({
    type: String,
    required: true,
    // validate: ['Please enter a valid email'],
    unique: true,
    lowercase: true,
  })
  email: String;

  @Prop({select: false, minlength: [6, 'Password must be at least 6 characters'] })
  password: string;

  @Prop({enum: GENDER, default: 'MALE' })
  gender: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true })
  countryId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: CURRENCY, required: true, default: 'USD' })
  preferredCurrency: String;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralCode' })
  userReferralCode: ReferralCode;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true })
  roleId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String })
  userNo: String;

  @Prop({ type: String })
  photo: String;

  @Prop({ type: String, enum: ['Email', 'Social'], required: true, default: 'Email' })
  source: String;

  @Prop({
    type: {
      type: String,
      id: String,
    },
  })
  social: {
    type: String;
    id: String;
  };

  @Prop({
    type: {
      isOnline: { type: Boolean, default: true },
      isLogin: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      isSelfdelete: { type: Boolean, default: false },
      profileStatus: { type: String, enum: ['Pending', 'Registered', 'Complete'], default: 'Registered' },
      lastConnect: { type: Date },
      isAvailableForCall: { type: Boolean, default: true },
      isPTFlag: { type: Boolean, default: false },
      gdprAccepted: { type: Boolean, default: false },
      isProfessional: { type: String, enum: ['Pending', 'Verified', 'Declined'] },
      isDeleted: { type: Boolean, default: false },
      deleteRequestDate: { type: Date },
    },
  })
  userStatus: {
    isOnline: boolean;
    isLogin: boolean;
    isActive: boolean;
    isSelfdelete: boolean;
    profileStatus: String;
    lastConnect: Date;
    isAvailableForCall: boolean;
    isPTFlag: boolean;
    gdprAccepted: boolean;
    isProfessional: String;
    isDeleted: boolean;
    deleteRequestDate: Date;
  };

  @Prop([{
    languages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],
    fee: { type: Number },
    usdFee: { type: Number },
    currency: { type: String, enum: CURRENCY, default: 'USD' },
  }])
  rates: {
    languages: mongoose.Schema.Types.ObjectId[];
    fee: number;
    usdFee: number;
    currency: String;
  }[];

  @Prop([{
    arnToken: { type: String, required: true },
    voipARNToken: { type: String },
    loginToken: { type: String, required: true, index: true },
    verificationToken: { type: String },
    resetToken: { type: String },
  }])
  userToken: {
    arnToken: String;
    voipARNToken?: String;
    loginToken: String;
    verificationToken?: String;
    resetToken?: String;
  }[];

  @Prop({
    type:{
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    }
  })
  verification: {
    email: boolean;
    phone: boolean;
  };

  @Prop({ type: Number, required: true, default: 0 })
  registrationSteps: number;

  @Prop({ type: String })
  stripeId: String;

  @Prop({
    type:{
    id: { type: String },
    legalEntity: {
      verification: {
        status: { type: String },
      },
    },
    verification: {
      disabledReason: { type: String },
    },
    externalAccounts: {
      data: [{
        status: { type: String },
      }],
    },}
  })
  stripe: {
    id: String;
    legalEntity: {
      verification: {
        status: String;
      };
    };
    verification: {
      disabledReason: String;
    };
    externalAccounts: {
      data: {
        status: String;
      }[];
    };
  };

  @Prop([{
    _id: mongoose.Schema.Types.ObjectId,
    number: String,
    isDefault: { type: Boolean, default: false },
    brand: String,
    name: String,
    cardId: String,
    fingerPrint: String,
    chargeId: String,
    isRefunded: { type: Boolean },
    type: { type: String, enum: ['DUES', 'NORMAL'] },
    isVerified: { type: String, enum: ['PENDING', 'APPROVED', 'INPROGRESS', 'DECLINED'], default: 'INPROGRESS' },
    cardType: { type: String, enum: ['OLD', 'NEW'], default: 'OLD' },
  }])
  cardData: {
    _id: mongoose.Schema.Types.ObjectId;
    number: String;
    isDefault: boolean;
    brand: String;
    name: String;
    cardId: String;
    fingerPrint: String;
    chargeId: String;
    isRefunded: boolean;
    type: String;
    isVerified: String;
    cardType: String;
  }[];

  @Prop({
    type: Object,
    os: String,
    version: String,
    language: String,
    deviceVersion: String,
    deviceName: String,
    lastConnectedDate: Date,
    timezone: String,
    
  })
  deviceInfo: {
    os: String;
    version: String;
    language: String;
    deviceVersion: String;
    deviceName: String;
    lastConnectedDate: Date;
    timezone: String;
  };

  @Prop({ type: Number, default: 0 })
  responseRate: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', function (next) {
  const user = this as UserDocument
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  // generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// Instance method for comparing passwords
UserSchema.methods.comparePassword = async function (
  password: string,
  callback: (err: any, isMatch: boolean) => void,
) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    callback(null, isMatch);
  } catch (err) {
    callback(err, false);
  }
};

