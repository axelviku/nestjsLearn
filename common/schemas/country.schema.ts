import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Country extends Document {
  @Prop({ type: String, unique: true, uppercase: true, required: [true, "can't be blank"] })
  dialCode: string;

  @Prop({ type: String, unique: true, uppercase: true, required: [true, "can't be blank"] })
  isoCode: string;

  @Prop({ type: String })
  flag: string;

  @Prop({
    type: Object,
    required: true,
    unique: true,
    index: true,
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
    validate: {
      validator: function (value: any) {
        const languages = ['en', 'jp', 'fr', 'zh', 'pt', 'ko', 'es', 'vi', 'tl', 'id', 'my'];
        for (const lang of languages) {
          if (!value[lang] || value[lang] === '') {
            return false;
          }
        }
        return true;
      },
      message: "can't be blank",
    },
  })
  name: {
    en: string;
    jp: string;
    fr: string;
    zh: string;
    pt: string;
    ko: string;
    es: string;
    vi: string;
    tl: string;
    id: string;
    my: string;
  };

  @Prop({ type: Boolean, default: false })
  isActive: boolean;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
