import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RestaurantSettings,
  RestaurantSettingsDocument,
} from '../schemas/restaurant-settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(RestaurantSettings.name)
    private readonly settingsModel: Model<RestaurantSettingsDocument>,
  ) {}

  async getPublic() {
    const settings = await this.ensureSingleton();
    return {
      name: settings.name,
      logoUrl: settings.logoUrl,
      address: settings.address,
      phone: settings.phone,
      openingHours: settings.openingHours,
      socialLinks: settings.socialLinks,
    };
  }

  async getAdmin() {
    return this.ensureSingleton();
  }

  async update(data: Partial<RestaurantSettings>) {
    const settings = await this.ensureSingleton();
    if (data.name !== undefined) settings.name = data.name;
    if (data.logoUrl !== undefined) settings.logoUrl = data.logoUrl;
    if (data.address !== undefined) settings.address = data.address;
    if (data.phone !== undefined) settings.phone = data.phone;
    if (data.openingHours !== undefined)
      settings.openingHours = data.openingHours;
    if (data.socialLinks !== undefined) settings.socialLinks = data.socialLinks;
    await settings.save();
    return settings;
  }

  private async ensureSingleton() {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        name: 'Food & Feast',
        openingHours: [],
        socialLinks: [],
      });
    }
    return settings;
  }
}
