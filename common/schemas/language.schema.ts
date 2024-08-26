import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Language {
  @Prop({
    type: {
      en: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      jp: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      fr: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      zh: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      pt: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      ko: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      es: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      vi: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      tl: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      id: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
      my: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        index: true,
      },
    },
    required: true,
  })
  name: Record<string, string>;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
