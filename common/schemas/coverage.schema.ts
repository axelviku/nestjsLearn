import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type CoverageDocument = Coverage & Document;

@Schema({ timestamps: true })
export class Coverage {
  @Prop({ type: [], ref: 'Language', required: true })
  languages: Types.ObjectId[];

  @Prop({ type: Number, required: true })
  coverage: number;
}

export const CoverageSchema = SchemaFactory.createForClass(Coverage);
