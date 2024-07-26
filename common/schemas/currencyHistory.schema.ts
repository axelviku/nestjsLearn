// currency-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Currency, CurrencySchema } from './currency.schema';

export type CurrencyHistoryDocument = CurrencyHistory & Document;

@Schema({ timestamps: true })
export class CurrencyHistory {
  @Prop({ type: [CurrencySchema], required: true })
  currencies: Currency[];
}

export const CurrencyHistorySchema =
  SchemaFactory.createForClass(CurrencyHistory);
