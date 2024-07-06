import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import {GENDER} from '../enums'

export type AdminUserDocument = AdminUser & Document;

@Schema({ timestamps: true })
export class AdminUser {
  @Prop({ required: true, maxlength: 80 })
  adminName: string;

  @Prop({
    type: String,
    enum: Object.keys(GENDER),
    default: GENDER.MALE,
  })
  gender: string;

  @Prop({ type: Types.ObjectId, ref: 'Country' })
  countryId: Types.ObjectId;

  @Prop()
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'AdminUserRole', required: true })
  roleId: Types.ObjectId;

  @Prop()
  photo: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (email: string) => {
        const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(email);
      },
      message: 'Please enter a valid email',
    },
  })
  email: string;

  @Prop({
    select: false,
    minlength: [8, 'Password must be at least 8 characters'],
  })
  password: string;

  @Prop({
    type: {
      browser: String,
      version: String,
      language: String,
      ipAddress: String,
      lastConnectedDate: Date,
    },
  })
  platformInfo: {
    browser: string;
    version: string;
    language: string;
    ipAddress: string;
    lastConnectedDate: Date;
  };

  @Prop()
  description: string;

  @Prop({ default: false })
  isActive: boolean;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
