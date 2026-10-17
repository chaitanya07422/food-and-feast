import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { slugify } from '../common/slug';
import { Category, CategoryDocument } from '../schemas/category.schema';
import {
  FoodType,
  MenuItem,
  MenuItemDocument,
  MenuItemStatus,
} from '../schemas/menu-item.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(MenuItem.name)
    private readonly itemModel: Model<MenuItemDocument>,
  ) {}

  /* ---------- Public ---------- */

  async listPublicCategories() {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
  }

  async listPublicItems(query: {
    category?: string;
    search?: string;
    foodType?: string;
  }) {
    const filter: Record<string, unknown> = {
      status: MenuItemStatus.PUBLISHED,
    };

    if (query.category) {
      const category = await this.categoryModel
        .findOne({ slug: query.category, isActive: true })
        .exec();
      if (!category) return [];
      filter.categoryId = category._id;
    }

    if (query.foodType) {
      filter.foodType = query.foodType;
    }

    if (query.search?.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    const search = query.search?.trim();
    let q = this.itemModel.find(filter);
    if (search) {
      q = q.select({ score: { $meta: 'textScore' } }).sort({
        score: { $meta: 'textScore' },
        displayOrder: 1,
      });
    } else {
      q = q.sort({ displayOrder: 1, name: 1 });
    }

    return q.populate('categoryId', 'name slug').lean().exec();
  }

  async getPublicItemBySlug(slug: string) {
    const item = await this.itemModel
      .findOne({ slug, status: MenuItemStatus.PUBLISHED })
      .populate('categoryId', 'name slug')
      .lean()
      .exec();
    if (!item) throw new NotFoundException('Dish not found');
    return item;
  }

  /* ---------- Admin categories ---------- */

  async adminListCategories() {
    const categories = await this.categoryModel
      .find()
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
    const counts = await this.itemModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }]);
    const map = new Map(counts.map((c) => [String(c._id), c.count]));
    return categories.map((c) => ({
      ...c,
      itemCount: map.get(String(c._id)) ?? 0,
    }));
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.slug?.trim() || slugify(dto.name);
    const exists = await this.categoryModel.findOne({ slug }).exec();
    if (exists) throw new ConflictException('Category slug already exists');
    return this.categoryModel.create({
      name: dto.name.trim(),
      slug,
      description: dto.description,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    if (dto.slug && dto.slug !== category.slug) {
      const exists = await this.categoryModel
        .findOne({ slug: dto.slug, _id: { $ne: id } })
        .exec();
      if (exists) throw new ConflictException('Category slug already exists');
      category.slug = dto.slug;
    }
    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.displayOrder !== undefined) category.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    await category.save();
    return category;
  }

  async deleteCategory(id: string, reassignTo?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category id');
    }
    const categoryObjectId = new Types.ObjectId(id);
    const count = await this.itemModel
      .countDocuments({ categoryId: categoryObjectId })
      .exec();
    if (count > 0) {
      if (!reassignTo) {
        throw new BadRequestException(
          `Category has ${count} dishes. Pass reassignTo category id to move them first.`,
        );
      }
      if (reassignTo === id) {
        throw new BadRequestException('Cannot reassign to the same category');
      }
      if (!Types.ObjectId.isValid(reassignTo)) {
        throw new BadRequestException('Invalid reassignTo category id');
      }
      const target = await this.categoryModel.findById(reassignTo).exec();
      if (!target) throw new NotFoundException('Target category not found');
      await this.itemModel
        .updateMany(
          { categoryId: categoryObjectId },
          { $set: { categoryId: new Types.ObjectId(reassignTo) } },
        )
        .exec();
    }
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Category not found');
    return { ok: true };
  }

  /* ---------- Admin items ---------- */

  async adminListItems(query: {
    search?: string;
    categoryId?: string;
    status?: string;
    available?: string;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.categoryId) {
      if (!Types.ObjectId.isValid(query.categoryId)) {
        throw new BadRequestException('Invalid category id');
      }
      // Cast explicitly — plain string filters do not match ObjectId fields reliably
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }
    if (query.status) filter.status = query.status;
    if (query.available === 'true') filter.isAvailable = true;
    if (query.available === 'false') filter.isAvailable = false;
    if (query.search?.trim()) {
      filter.name = { $regex: query.search.trim(), $options: 'i' };
    }
    return this.itemModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('categoryId', 'name slug')
      .lean()
      .exec();
  }

  async adminGetItem(id: string) {
    const item = await this.itemModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .lean()
      .exec();
    if (!item) throw new NotFoundException('Dish not found');
    return item;
  }

  async createItem(dto: CreateMenuItemDto) {
    await this.ensureCategory(dto.categoryId);
    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueItemSlug(slug);
    return this.itemModel.create({
      ...dto,
      name: dto.name.trim(),
      slug,
      currency: 'INR',
      foodType: dto.foodType ?? FoodType.UNSPECIFIED,
      isFeatured: dto.isFeatured ?? false,
      isAvailable: dto.isAvailable ?? true,
      status: dto.status ?? MenuItemStatus.DRAFT,
      displayOrder: dto.displayOrder ?? 0,
    });
  }

  async updateItem(id: string, dto: UpdateMenuItemDto) {
    const item = await this.itemModel.findById(id).exec();
    if (!item) throw new NotFoundException('Dish not found');
    if (dto.categoryId) await this.ensureCategory(dto.categoryId);
    if (dto.slug && dto.slug !== item.slug) {
      await this.ensureUniqueItemSlug(dto.slug, id);
      item.slug = dto.slug;
    }
    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.categoryId !== undefined)
      item.categoryId = new Types.ObjectId(dto.categoryId);
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl;
    if (dto.imageAlt !== undefined) item.imageAlt = dto.imageAlt;
    if (dto.foodType !== undefined) item.foodType = dto.foodType;
    if (dto.isFeatured !== undefined) item.isFeatured = dto.isFeatured;
    if (dto.isAvailable !== undefined) item.isAvailable = dto.isAvailable;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.displayOrder !== undefined) item.displayOrder = dto.displayOrder;
    await item.save();
    return item;
  }

  async deleteItem(id: string) {
    const deleted = await this.itemModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Dish not found');
    return { ok: true };
  }

  async dashboardStats() {
    const [
      totalItems,
      published,
      unavailable,
      unpublished,
      totalCategories,
      recent,
    ] = await Promise.all([
      this.itemModel.countDocuments().exec(),
      this.itemModel
        .countDocuments({ status: MenuItemStatus.PUBLISHED })
        .exec(),
      this.itemModel.countDocuments({ isAvailable: false }).exec(),
      this.itemModel.countDocuments({ status: MenuItemStatus.DRAFT }).exec(),
      this.categoryModel.countDocuments().exec(),
      this.itemModel
        .find()
        .sort({ updatedAt: -1 })
        .limit(8)
        .select('name price status isAvailable updatedAt')
        .lean()
        .exec(),
    ]);
    return {
      totalItems,
      published,
      unavailable,
      unpublished,
      totalCategories,
      recent,
    };
  }

  private async ensureCategory(id: string) {
    const cat = await this.categoryModel.findById(id).exec();
    if (!cat) throw new BadRequestException('Invalid category');
  }

  private async ensureUniqueItemSlug(slug: string, excludeId?: string) {
    const filter: Record<string, unknown> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await this.itemModel.findOne(filter).exec();
    if (exists) throw new ConflictException('Dish slug already exists');
  }
}
