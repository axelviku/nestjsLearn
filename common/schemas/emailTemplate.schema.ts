import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmailDocument = EmailTemplate & Document;

@Schema()
export class EmailTemplate {
  @Prop({ type: String, required: true })
  slug: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: Object, required: true })
  subject: {
    en: string;
    jp: string;
    ko: string;
  };
  @Prop({ type: Object, required: true })
  content: {
    en: string;
    jp: string;
    ko: string;
  };
  @Prop({ type: Array })
  shotCodes: string[];
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
