// user-activity.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true })
export class UserActivity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: {
      os: { type: String },
      version: { type: String },
      language: { type: String },
      deviceVersion: { type: String },
      deviceName: { type: String },
      lastConnectedDate: { type: Date },
      timezone: { type: String },
    },
    required: true,
  })
  deviceInfo: {
    os: string;
    version: string;
    language: string;
    deviceVersion: string;
    deviceName: string;
    lastConnectedDate: Date;
    timezone: string;
  };
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
