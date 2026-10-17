import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HeroSlideDocument = HydratedDocument<HeroSlide>;

@Schema({ timestamps: true, collection: 'hero_slides' })
export class HeroSlide {
  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true, trim: true })
  imageUrl!: string;

  @Prop({ type: String, trim: true })
  imageAlt?: string;

  @Prop({ type: Number, required: true, default: 0 })
  displayOrder!: number;

  @Prop({ type: Boolean, required: true, default: true })
  isActive!: boolean;
}

export const HeroSlideSchema = SchemaFactory.createForClass(HeroSlide);
HeroSlideSchema.index({ displayOrder: 1, isActive: 1 });
