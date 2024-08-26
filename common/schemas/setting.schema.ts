import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class AppSettings {
  @Prop({})
  iosVersion: string;

  @Prop({ default: false })
  iosForceUpdate: boolean;

  @Prop({})
  androidVersion: string;

  @Prop({ default: false })
  androidForceUpdate: boolean;
}

@Schema()
export class EmailSettings {
  @Prop({ default: true })
  isEnabled: boolean;

  @Prop({})
  supportEmail: string;

  @Prop({})
  ccEmail: string;

  @Prop({ default: false })
  bccEmail: boolean;
}

@Schema()
export class ChatSettings {
  @Prop({})
  recordsLimit: string;
}

@Schema()
export class CallSettings {
  @Prop({ default: true })
  isEnabled: boolean;

  @Prop({})
  maxCallDuration: string;
}

@Schema()
export class PaymentSettings {
  @Prop({ default: 40 })
  minCashoutAmountUSD: number;

  @Prop({ default: '0.8' })
  minCurrencyRateAmountUSD: string;

  @Prop({ default: 10 })
  minQuickPayAmountUSD: number;

  @Prop({ default: 1 })
  cardDefaultChargeAmount: number;

  @Prop({ default: 60 })
  interpreterEarningPercentage: number;

  @Prop({ default: 40 })
  oyraaEarningPercentage: number;

  @Prop({ default: 5 })
  referralAdminEarningPercentage: number;

  @Prop({})
  stripeConsumptionTaxID: string;

  @Prop({})
  stripeServiceChargeID: string;
}

@Schema()
export class PolicyTermsSettings {
  @Prop({})
  policyTermsFlag: string;

  @Prop({})
  resetPolicyTermslag: string;

  @Prop({
    type: Map,
    of: String,
  })
  messageContent: Record<string, string>;
}

@Schema()
export class MaintenanceMode {
  @Prop({ default: false })
  isEnabled: boolean;

  @Prop()
  message: boolean;
}
@Schema()
export class DataCollectionAndAnalysis {
  @Prop({
    type: Map,
    of: String,
    default: {
      en: '',
      jp: '',
      fr: '',
      zh: '',
      pt: '',
      ko: '',
      es: '',
      vi: '',
      tl: '',
      id: '',
      my: '',
    },
  })
  title: Map<string, string>;

  @Prop({
    type: Map,
    of: String,
    default: {
      en: '',
      jp: '',
      fr: '',
      zh: '',
      pt: '',
      ko: '',
      es: '',
      vi: '',
      tl: '',
      id: '',
      my: '',
    },
  })
  description: Map<string, string>;

  @Prop({
    type: Map,
    of: String,
    default: {
      en: '',
      jp: '',
      fr: '',
      zh: '',
      pt: '',
      ko: '',
      es: '',
      vi: '',
      tl: '',
      id: '',
      my: '',
    },
  })
  longDescription: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  roleId: MongooseSchema.Types.ObjectId;
}

@Schema()
class NestedObject {
  @Prop({ type: DataCollectionAndAnalysis })
  interpreter: DataCollectionAndAnalysis;

  @Prop({ type: DataCollectionAndAnalysis })
  client: DataCollectionAndAnalysis;
}

@Schema()
export class Setting extends Document {
  @Prop({ default: 'app-oyraa' })
  appType: string;

  @Prop({ type: AppSettings })
  appSettings: AppSettings;

  @Prop({ type: EmailSettings })
  emailSettings: EmailSettings;

  @Prop({ type: ChatSettings })
  chatSettings: ChatSettings;

  @Prop({ type: CallSettings })
  callSettings: CallSettings;

  @Prop({ type: PaymentSettings })
  paymentSettings: PaymentSettings;

  @Prop({ type: PolicyTermsSettings })
  policyTermsSettings: PolicyTermsSettings;

  @Prop({ type: MaintenanceMode })
  maintenanceMode: MaintenanceMode;

  @Prop({ type: NestedObject })
  dataCollectionAndAnalysis: NestedObject;

  @Prop({ type: Array, required: true })
  aboutOyraaData: {
    section: { en: string; jp: string };
    headerTitle: { en: string; jp: string };
    title: { en: string; jp: string };
    body: { en: string; jp: string };
    imageLinks: string;
  }[];

  @Prop({ type: Array, required: true })
  metaData: {
    onlineStatusText: { en: string; jp: string; ko: string };
    responseRateText: { en: string; jp: string; ko: string };
  }[];
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
