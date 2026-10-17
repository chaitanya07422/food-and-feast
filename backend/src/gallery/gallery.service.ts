import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GalleryImage,
  GalleryImageDocument,
} from '../schemas/gallery-image.schema';
import { CreateGalleryImageDto, UpdateGalleryImageDto } from './dto/gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryImage.name)
    private readonly galleryModel: Model<GalleryImageDocument>,
  ) {}

  listPublic() {
    return this.galleryModel
      .find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()
      .exec();
  }

  listAdmin() {
    return this.galleryModel
      .find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()
      .exec();
  }

  create(dto: CreateGalleryImageDto) {
    return this.galleryModel.create({
      title: dto.title.trim(),
      imageUrl: dto.imageUrl,
      imageAlt: dto.imageAlt?.trim() || dto.title.trim(),
      displayOrder: dto.displayOrder ?? 0,
      isPublished: dto.isPublished ?? true,
    });
  }

  async update(id: string, dto: UpdateGalleryImageDto) {
    const doc = await this.galleryModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Gallery image not found');
    if (dto.title !== undefined) doc.title = dto.title.trim();
    if (dto.imageUrl !== undefined) doc.imageUrl = dto.imageUrl;
    if (dto.imageAlt !== undefined) doc.imageAlt = dto.imageAlt.trim();
    if (dto.displayOrder !== undefined) doc.displayOrder = dto.displayOrder;
    if (dto.isPublished !== undefined) doc.isPublished = dto.isPublished;
    await doc.save();
    return doc;
  }

  async remove(id: string) {
    const deleted = await this.galleryModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Gallery image not found');
    return { ok: true };
  }
}
