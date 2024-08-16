import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Prefecture extends Document {
  @Prop({
    type: Object,
    required: true,
    unique: true,
    index: true,
    default: {
      en: '',
      jp: '',
    },
    validate: {
      validator: function (value: any) {
        const languages = ['en', 'jp'];
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
  };

  @Prop({ type: Boolean, default: false })
  isActive: boolean;
}

export const PrefectureSchema = SchemaFactory.createForClass(Prefecture);
