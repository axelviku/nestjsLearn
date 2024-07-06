import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminUserRoleDocument = AdminUserRole & Document;

class Permission {
  @Prop({ type: Boolean })
  view: boolean;

  @Prop({ type: Boolean })
  add: boolean;

  @Prop({ type: Boolean })
  edit: boolean;

  @Prop({ type: Boolean })
  delete: boolean;
}

class CashoutPermission {
  @Prop({ type: Boolean })
  view: boolean;

  @Prop({ type: Boolean })
  payout: boolean;

  @Prop({ type: Boolean })
  decline: boolean;
}

class CommonSettingsPermission {
  @Prop({ type: Permission })
  country: Permission;

  @Prop({ type: Permission })
  city: Permission;

  @Prop({ type: Permission })
  expertise: Permission;

  @Prop({ type: Permission })
  language: Permission;

  @Prop({ type: Permission })
  currency: Permission;

  @Prop({ type: Permission })
  phraseBook: Permission;
}

class SuperAdminPermissions {
  @Prop({ type: Permission })
  roles: Permission;

  @Prop({ type: Permission })
  users: Permission;

  @Prop({ type: Permission })
  referralManager: Permission;

  @Prop({ type: Permission })
  enterpriseManager: Permission;

  @Prop({ type: Permission })
  callHistory: Permission;

  @Prop({ type: Permission })
  chatHistory: Permission;

  @Prop({ type: CashoutPermission })
  cashoutHistory: CashoutPermission;

  @Prop({ type: Permission })
  quickPayHistory: Permission;

  @Prop({ type: Permission })
  broadcastRequestHistory: Permission;

  @Prop({ type: Permission })
  schedulePushNotification: Permission;

  @Prop({ type: Permission })
  sendEmailPushAnnouncement: Permission;

  @Prop({ type: Permission })
  termsAndPolicyAppAlert: Permission;

  @Prop({ type: CommonSettingsPermission })
  commonSettings: CommonSettingsPermission;

  @Prop({ type: Permission })
  forceUpdate: Permission;

  @Prop({ type: Permission })
  maintenanceMode: Permission;
}

class AdminPermissions {
  @Prop({ type: Permission })
  users: Permission;

  @Prop({ type: Permission })
  interpreters: Permission;

  @Prop({ type: Permission })
  callHistory: Permission;

  @Prop({ type: Permission })
  chatHistory: Permission;

  @Prop({ type: Permission })
  sendEmailPushAnnouncement: Permission;
}

@Schema({ timestamps: true })
export class AdminUserRole {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: SuperAdminPermissions })
  superAdminPermissions: SuperAdminPermissions;

  @Prop({ type: AdminPermissions })
  adminPermissions: AdminPermissions;

  @Prop()
  description: string;

  @Prop({ default: false })
  isActive: boolean;
}

export const AdminUserRoleSchema = SchemaFactory.createForClass(AdminUserRole);
