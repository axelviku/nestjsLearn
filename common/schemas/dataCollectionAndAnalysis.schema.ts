import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DataCollectionDocument = DataCollectionAndAnalysis & Document;

@Schema({ timestamps: true })
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
  clientDescription: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  roleId: MongooseSchema.Types.ObjectId;
}

export const DataCollectionAndAnalysisSchema = SchemaFactory.createForClass(
  DataCollectionAndAnalysis,
);
