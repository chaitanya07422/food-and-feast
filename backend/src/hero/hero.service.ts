import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroSlide, HeroSlideDocument } from '../schemas/hero-slide.schema';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero.dto';

@Injectable()
export class HeroService {
  constructor(
    @InjectModel(HeroSlide.name)
    private readonly heroModel: Model<HeroSlideDocument>,
  ) {}

  listPublic() {
    return this.heroModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('title imageUrl imageAlt displayOrder')
      .lean()
      .exec();
  }

  listAdmin() {
    return this.heroModel
      .find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()
      .exec();
  }

  create(dto: CreateHeroSlideDto) {
    return this.heroModel.create({
      title: dto.title.trim(),
      imageUrl: dto.imageUrl,
      imageAlt: dto.imageAlt?.trim() || dto.title.trim(),
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: string, dto: UpdateHeroSlideDto) {
    const doc = await this.heroModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Hero slide not found');
    if (dto.title !== undefined) doc.title = dto.title.trim();
    if (dto.imageUrl !== undefined) doc.imageUrl = dto.imageUrl;
    if (dto.imageAlt !== undefined) doc.imageAlt = dto.imageAlt.trim();
    if (dto.displayOrder !== undefined) doc.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    await doc.save();
    return doc;
  }

  async remove(id: string) {
    const deleted = await this.heroModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Hero slide not found');
    return { ok: true };
  }
}
