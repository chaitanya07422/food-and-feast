import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import {
  AdminRole,
  AdminUser,
  AdminUserDocument,
} from '../schemas/admin-user.schema';

/**
 * Keeps the owner admin account in sync with ADMIN_BOOTSTRAP_EMAIL /
 * ADMIN_BOOTSTRAP_PASSWORD from the environment (source of truth for deploy).
 */
@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(AdminUser.name)
    private readonly adminModel: Model<AdminUserDocument>,
  ) {}

  async onModuleInit() {
    const email = (this.config.get<string>('adminBootstrapEmail') ?? '')
      .trim()
      .toLowerCase();
    const password = this.config.get<string>('adminBootstrapPassword') ?? '';

    if (!email || !password) {
      this.logger.warn(
        'ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD not set — skipping admin sync',
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const existing = await this.adminModel.findOne({ email }).exec();

    if (!existing) {
      await this.adminModel.create({
        email,
        passwordHash,
        role: AdminRole.OWNER,
        isActive: true,
      });
      this.logger.log(`Created admin user from env: ${email}`);
      return;
    }

    existing.passwordHash = passwordHash;
    existing.isActive = true;
    existing.role = existing.role || AdminRole.OWNER;
    await existing.save();
    this.logger.log(`Synced admin password from env: ${email}`);
  }
}
