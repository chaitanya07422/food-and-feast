import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantSettingsDocument = HydratedDocument<RestaurantSettings>;

export type OpeningHoursDay = {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

export type SocialLink = {
  platform: string;
  url: string;
};

@Schema({ timestamps: true, collection: 'restaurant_settings' })
export class RestaurantSettings {
  @Prop({ type: String, required: true, trim: true, default: 'Food & Feast' })
  name!: string;

  @Prop({ type: String, trim: true })
  logoUrl?: string;

  @Prop({ type: String, trim: true })
  address?: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({
    type: [{ day: String, open: String, close: String, closed: Boolean }],
    default: [],
  })
  openingHours!: OpeningHoursDay[];

  @Prop({ type: [{ platform: String, url: String }], default: [] })
  socialLinks!: SocialLink[];
}

export const RestaurantSettingsSchema =
  SchemaFactory.createForClass(RestaurantSettings);
