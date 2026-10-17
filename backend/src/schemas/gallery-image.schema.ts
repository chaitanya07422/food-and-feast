import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GalleryImageDocument = HydratedDocument<GalleryImage>;

@Schema({ timestamps: true, collection: 'gallery_images' })
export class GalleryImage {
  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true, trim: true })
  imageUrl!: string;

  @Prop({ type: String, trim: true })
  imageAlt?: string;

  @Prop({ type: Number, required: true, default: 0 })
  displayOrder!: number;

  @Prop({ type: Boolean, required: true, default: true })
  isPublished!: boolean;
}

export const GalleryImageSchema = SchemaFactory.createForClass(GalleryImage);
GalleryImageSchema.index({ displayOrder: 1 });
