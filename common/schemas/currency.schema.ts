// currency.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyDocument = Currency & Document;

@Schema({ timestamps: true })
export class Currency {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, uppercase: true, required: true })
  baseCurrency: string;

  @Prop({
    type: [
      {
        conversionToCurrency: { type: String },
        conversionValue: { type: Number },
      },
    ],
  })
  exchangeRates: {
    conversionToCurrency: string;
    conversionValue: number;
  }[];

  @Prop({ required: true })
  symbol: string;

  @Prop({ default: false })
  isRound: boolean;

  @Prop()
  lastUpdatedOn: Date;

  @Prop({ default: false })
  isActive: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
