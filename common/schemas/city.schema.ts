import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Country } from './country.schema';

export type CityDocument = City & Document;

@Schema({ timestamps: true })
export class City {
  @Prop({ type: Types.ObjectId, ref: 'Country' })
  countryId: Country;

  @Prop({
    type:Object,
    en: { type: String, unique: true, required: true },
    jp: { type: String, unique: true, required: true },
    fr: { type: String, unique: true, required: true },
    zh: { type: String, unique: true, required: true },
    pt: { type: String, unique: true, required: true },
    ko: { type: String, unique: true, required: true },
    es: { type: String, unique: true, required: true },
    vi: { type: String, unique: true, required: true },
    tl: { type: String, unique: true, required: true },
    id: { type: String, unique: true, required: true },
    my: { type: String, unique: true, required: true },
  })
  name: {
    en: String;
    jp: String;
    fr: String;
    zh: String;
    pt: String;
    ko: String;
    es: String;
    vi: String;
    tl: String;
    id: String;
    my: String;
  };

  @Prop({ type: Boolean, default: false })
  isActive: boolean;
}

export const CitySchema = SchemaFactory.createForClass(City);
