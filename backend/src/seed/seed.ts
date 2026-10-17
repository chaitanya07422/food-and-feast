import { config as loadEnv } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';
import mongoose, { Schema } from 'mongoose';

loadEnv();

type SeedFile = {
  restaurant: {
    name: string;
    address: string;
    phone: string;
    openingHours?: unknown[];
    socialLinks?: unknown[];
  };
  categories: Array<{
    name: string;
    slug: string;
    displayOrder: number;
    isActive: boolean;
  }>;
  items: Array<{
    name: string;
    slug: string;
    price: number;
    categorySlug: string;
    foodType: string;
    isFeatured: boolean;
    isAvailable: boolean;
    status: string;
    displayOrder: number;
  }>;
};

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast';
  const email = (
    process.env.ADMIN_BOOTSTRAP_EMAIL ?? 'owner@example.com'
  ).toLowerCase();
  const password =
    process.env.ADMIN_BOOTSTRAP_PASSWORD ?? 'ChangeMeLocalOnly123!';

  const data = JSON.parse(
    readFileSync(join(__dirname, 'menu-data.json'), 'utf8'),
  ) as SeedFile;

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const Category = mongoose.model(
    'Category',
    new Schema(
      {
        name: String,
        slug: { type: String, unique: true },
        description: String,
        displayOrder: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true, collection: 'categories' },
    ),
  );

  const MenuItem = mongoose.model(
    'MenuItem',
    new Schema(
      {
        name: String,
        slug: { type: String, unique: true },
        description: String,
        price: Number,
        currency: { type: String, default: 'INR' },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
        imageUrl: String,
        imageAlt: String,
        foodType: String,
        isFeatured: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: true },
        status: { type: String, default: 'draft' },
        displayOrder: { type: Number, default: 0 },
      },
      { timestamps: true, collection: 'menu_items' },
    ),
  );

  const AdminUser = mongoose.model(
    'AdminUser',
    new Schema(
      {
        email: { type: String, unique: true },
        passwordHash: String,
        role: { type: String, default: 'owner' },
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true, collection: 'admin_users' },
    ),
  );

  const RestaurantSettings = mongoose.model(
    'RestaurantSettings',
    new Schema(
      {
        name: String,
        logoUrl: String,
        address: String,
        phone: String,
        openingHours: { type: Array, default: [] },
        socialLinks: { type: Array, default: [] },
      },
      { timestamps: true, collection: 'restaurant_settings' },
    ),
  );

  await Promise.all([
    Category.deleteMany({}),
    MenuItem.deleteMany({}),
    RestaurantSettings.deleteMany({}),
  ]);

  const categories = await Category.insertMany(data.categories);
  const bySlug = new Map(categories.map((c) => [c.slug, c._id]));

  const items = data.items.map((item) => {
    const categoryId = bySlug.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category ${item.categorySlug} for ${item.name}`);
    }
    return {
      name: item.name,
      slug: item.slug,
      price: item.price,
      currency: 'INR',
      categoryId,
      foodType: item.foodType,
      isFeatured: item.isFeatured,
      isAvailable: item.isAvailable,
      status: item.status,
      displayOrder: item.displayOrder,
    };
  });

  await MenuItem.insertMany(items);

  await RestaurantSettings.create({
    name: data.restaurant.name,
    address: data.restaurant.address,
    phone: data.restaurant.phone,
    openingHours: data.restaurant.openingHours ?? [],
    socialLinks: data.restaurant.socialLinks ?? [],
  });

  const existingAdmin = await AdminUser.findOne({ email });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 12);
    await AdminUser.create({
      email,
      passwordHash,
      role: 'owner',
      isActive: true,
    });
    console.log(`Created admin: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  console.log(
    `Seeded ${categories.length} categories and ${items.length} dishes from the menu PDF.`,
  );
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
