// user.schema.ts
import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { GENDER, CURRENCY, SOURCE } from 'common/enums';
import { ReferralCode } from './referralCode.schema';
import { Sequence } from './sequence.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, maxLength: 80 })
  fullName: string;

  @Prop({ required: true, enum: ['email', 'social'], default: 'Email' })
  source: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ReferralCode' })
  userReferralCode: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    validate: [
      (email) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
      'Please enter a valid email',
    ],
  })
  email: string;

  @Prop({ select: false, minlength: 8 })
  password: string;

  @Prop({
    type: [
      {
        type: {
          type: String,
        },
        id: {
          type: String,
        },
      },
    ],
    default: [],
  })
  social: { type: string; id: string }[];

  @Prop()
  mobile: string;

  @Prop()
  formattedMobile: string;

  @Prop({
    type: {
      userNo: String,
      gender: { type: String, enum: [GENDER], default: 'male' },
      photo: String,
      countryId: { type: Types.ObjectId, ref: 'Country', required: true },
      cityId: { type: Types.ObjectId, ref: 'City' },
      preferredCurrency: {
        type: String,
        enum: [...Object.keys(CURRENCY)],
        required: true,
        default: 'USD',
      },
    },
  })
  personalInfo: {
    userNo: string;
    gender: GENDER;
    photo: string;
    countryId: Types.ObjectId;
    cityId: Types.ObjectId;
    preferredCurrency: CURRENCY;
  };

  @Prop({
    type: {
      isNotify: { type: Boolean, default: true },
      lastNotification: { type: Date, default: Date.now() },
      badge: { type: Number, default: 0 },
    },
  })
  userNotifications: {
    isNotify: boolean;
    lastNotification: Date;
    badge: number;
  };

  @Prop({
    type: {
      callReceived: { type: Number, default: 0 },
      callMissed: { type: Number, default: 0 },
      callPinged: { type: Number, default: 0 },
      callDialed: { type: Number, default: 0 },
      missCount: { type: Number, default: 0 },
      callFailed: { type: Number, default: 0 },
    },
  })
  callDetails: {
    callReceived: number;
    callMissed: number;
    callPinged: number;
    callDialed: number;
    missCount: number;
    callFailed: number;
  };

  @Prop([{ userId: { type: Types.ObjectId }, reason: { type: String } }])
  blockedUsers: { userId: Types.ObjectId; reason: string }[];

  @Prop([{ type: Types.ObjectId, ref: 'Language' }])
  nativeLanguages: [];

  @Prop({ type: Types.ObjectId, ref: 'Language' })
  prefectureId: Types.ObjectId;

  @Prop({
    type: {
      profileDetails: String,
      interpretationLanguages: [{ type: Types.ObjectId, ref: 'Language' }],
      expertiseList: [{ type: Types.ObjectId, ref: 'Expertise' }],
      associations: [String],
      quilification: [String],
      academicBackground: [String],
      interpreterRates: [
        {
          languages: [{ type: Types.ObjectId, ref: 'Language' }],
          fee: Number,
          usdFee: Number,
          currency: {
            type: String,
            enum: [...Object.keys(CURRENCY)],
            default: 'USD',
          },
        },
      ],
      responseRate: { type: Number, default: 0 },
      ratingDetails: {
        rated: { type: Number, default: 0 },
        totalRating: { type: Number, default: 0 },
        avgRating: { type: Number, default: 0 },
      },
      professionalDocs: [{ title: String, document: String }],
    },
  })
  interpreterInfo: {
    profileDetails: string;
    speakingLanguages: Types.ObjectId[];
    expertiseList: Types.ObjectId[];
    associations: string[];
    quilification: string[];
    academicBackground: string[];
    interpreterRates: {
      languages: Types.ObjectId[];
      fee: number;
      usdFee: number;
      currency: CURRENCY;
    }[];
    responseRate: number;
    ratingDetails: {
      rated: number;
      totalRating: number;
      avgRating: number;
    };
    professionalDocs: { title: string; document: string }[];
  };

  @Prop({
    type: {
      ecInterpreterAssociates: [{ type: Types.ObjectId, ref: 'User' }],
    },
  })
  enterpriseInfo: {
    ecInterpreterAssociates: Types.ObjectId[];
  };

  @Prop({
    type: Object,
    default: {
      japaneseLevel: '',
      foreigner_location: ' ',
      foreginer_working_at: ' ',
      staff_designation: ' ',
    },
  })
  enterpriseCompanyForeigner: {
    enterprise_company_id: string;
    japaneseLevel: string;
    foreigner_location: string;
    foreginer_working_at: string;
    staff_designation: string;
  };

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  favUsers: Types.ObjectId[];

  @Prop({
    type: {
      isOnline: { type: Boolean, default: true },
      isLogin: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      isSelfdelete: { type: Boolean, default: false },
      profileStatus: {
        type: String,
        enum: ['Pending', 'Registered', 'Complete'],
        default: 'Registered',
      },
      lastConnect: { type: Date },
      isAvailableForCall: { type: Boolean, default: true },
      isPTFlag: { type: Boolean, default: false },
      gdprAccepted: { type: Boolean, default: false },
      isProfessional: {
        type: String,
        enum: ['Pending', 'Verified', 'Declined'],
      },
      isDeleted: { type: Boolean, default: false },
      deleteRequestDate: { type: Date },
    },
  })
  status: {
    isOnline: boolean;
    isLogin: boolean;
    isActive: boolean;
    isSelfdelete: boolean;
    profileStatus: string;
    lastConnect: Date;
    isAvailableForCall: boolean;
    isPTFlag: boolean;
    gdprAccepted: boolean;
    isProfessional: string;
    isDeleted: boolean;
    deleteRequestDate: Date;
  };

  @Prop({
    type: {
      arn: { type: String, required: true },
      voip: { type: String },
      login: { type: String, required: true, index: true },
    },
  })
  token: {
    arn: string;
    voip: string;
    login: string;
  };

  @Prop({
    type: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      resetEmail: { type: Boolean, default: false },
      resetPhone: { type: Boolean, default: false },
    },
  })
  verification: {
    email: boolean;
    phone: boolean;
    resetEmail: boolean;
    resetPhone: boolean;
  };

  @Prop({
    type: {
      emailVerify: { type: Boolean, default: false },
      registerScreen: { type: Boolean, default: false },
      dataAnalysisScreen: { type: Boolean, default: false },
      tutorialScreen: { type: Boolean, default: false },
    },
  })
  registrationSteps: {
    emailVerify: boolean;
    registerScreen: boolean;
    dataAnalysisScreen: boolean;
    tutorialScreen: boolean;
  };

  @Prop({
    type: {
      customerId: { type: String },
      stripeConnect: {
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
          data: [{ status: { type: String } }],
        },
      },
      cardData: [
        {
          _id: Types.ObjectId,
          number: String,
          isDefault: { type: Boolean, default: false },
          brand: String,
          name: String,
          cardId: String,
          fingerPrint: String,
          chargeId: String,
          isRefunded: { type: Boolean },
          type: { type: String, enum: ['DUES', 'NORMAL'] },
          isVerified: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'INPROGRESS', 'DECLINED'],
            default: 'INPROGRESS',
          },
          cardType: { type: String, enum: ['OLD', 'NEW'], default: 'OLD' },
        },
      ],
    },
  })
  stripeInfo: {
    customerId: string;
    stripeConnect: {
      id: string;
      legalEntity: {
        verification: {
          status: string;
        };
      };
      verification: {
        disabledReason: string;
      };
      externalAccounts: {
        data: { status: string }[];
      };
    };
    cardData: {
      _id: Types.ObjectId;
      number: string;
      isDefault: boolean;
      brand: string;
      name: string;
      cardId: string;
      fingerPrint: string;
      chargeId: string;
      isRefunded: boolean;
      type: string;
      isVerified: string;
      cardType: string;
    }[];
  };

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  systemUser: Types.ObjectId[];

  @Prop({
    type: {
      isSystem: { type: Boolean, default: false },
      loggedByAdmin: { type: Boolean, default: false },
    },
  })
  systemInfo: {
    isSystem: boolean;
    loggedByAdmin: boolean;
  };

  @Prop({
    type: {
      os: { type: String },
      version: { type: String },
      language: { type: String },
      deviceVersion: { type: String },
      deviceName: { type: String },
      lastConnectedDate: { type: Date },
      timezone: { type: String },
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

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', function (next) {
  const user = this as UserDocument;
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
