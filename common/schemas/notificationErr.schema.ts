import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types  } from 'mongoose';
export type NotificationErrorDocument = NotificationError & Document;

@Schema({ timestamps:true })
export class NotificationError {
  @Prop({ type: Object })
  data: string;
}

export const NotificationErrorSchema = SchemaFactory.createForClass(NotificationError);
