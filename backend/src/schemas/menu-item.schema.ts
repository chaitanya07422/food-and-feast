import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

export enum FoodType {
  VEGETARIAN = 'vegetarian',
  NON_VEGETARIAN = 'non_vegetarian',
  UNSPECIFIED = 'unspecified',
}

export enum MenuItemStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Schema({ timestamps: true, collection: 'menu_items' })
export class MenuItem {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug!: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Number, required: true, min: 0 })
  price!: number;

  @Prop({ type: String, required: true, default: 'INR', enum: ['INR'] })
  currency!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: String, trim: true })
  imageUrl?: string;

  @Prop({ type: String, trim: true })
  imageAlt?: string;

  @Prop({
    type: String,
    enum: Object.values(FoodType),
    default: FoodType.UNSPECIFIED,
  })
  foodType!: FoodType;

  @Prop({ type: Boolean, required: true, default: false })
  isFeatured!: boolean;

  @Prop({ type: Boolean, required: true, default: true })
  isAvailable!: boolean;

  @Prop({
    type: String,
    enum: Object.values(MenuItemStatus),
    default: MenuItemStatus.DRAFT,
    index: true,
  })
  status!: MenuItemStatus;

  @Prop({ type: Number, required: true, default: 0 })
  displayOrder!: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.index({ categoryId: 1, displayOrder: 1 });
MenuItemSchema.index({ status: 1, isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });
