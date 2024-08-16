import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type ExpertiseDocument = Expertise & Document;
class ExpertiseName {
  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  en: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  jp: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  fr: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  zh: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  pt: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  ko: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  es: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  vi: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  tl: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  id: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  })
  my: string;
}

@Schema({ timestamps: true })
export class Expertise {
  @Prop({ type: ExpertiseName, required: true })
  name: ExpertiseName;

  @Prop({ type: Boolean, default: false })
  isActive: boolean;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Heading' })
  // codeType: Heading;
}

export const ExpertiseSchema = SchemaFactory.createForClass(Expertise);
