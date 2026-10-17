import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminUserDocument = HydratedDocument<AdminUser>;

export enum AdminRole {
  OWNER = 'owner',
}

@Schema({ timestamps: true, collection: 'admin_users' })
export class AdminUser {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    enum: Object.values(AdminRole),
    default: AdminRole.OWNER,
  })
  role!: AdminRole;

  @Prop({ type: Boolean, required: true, default: true })
  isActive!: boolean;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
