/**
 * Assigns clearly labelled MOCK stock photos to menu items for local demo.
 * These are NOT restaurant photography — replace via Admin → Menu → Dish photo.
 */
import { config as loadEnv } from 'dotenv';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import mongoose, { Schema } from 'mongoose';

loadEnv();

const PLACEHOLDER_ALT =
  'Temporary mock photo for demo — not Food & Feast restaurant photography. Replace with real dish photo.';

function pickImage(categorySlug: string, name: string): string {
  const n = name.toLowerCase();
  if (/biryani|pulav|pulao/.test(n) || categorySlug.includes('biryani') || categorySlug.includes('pulav'))
    return 'biryani.jpg';
  if (/paneer|panner/.test(n)) return 'paneer.jpg';
  if (/prawn|shrimp/.test(n)) return 'prawn.jpg';
  if (/fish|apollo/.test(n)) return 'fish.jpg';
  if (/mutton|keema/.test(n)) return 'mutton.jpg';
  if (/soup/.test(n) || categorySlug.includes('soup')) return 'soup.jpg';
  if (/noodle/.test(n) || categorySlug.includes('noodle')) return 'noodles.jpg';
  if (/fried rice|jeera rice|curd rice|rice/.test(n) || categorySlug.includes('fried-rice'))
    return 'fried-rice.jpg';
  if (/naan|roti|paratha|parata|kulcha|bread/.test(n) || categorySlug.includes('bread'))
    return 'bread.jpg';
  if (/mojito|lassi|cola|thums|sprite|fanta|water|beverage|buttermilk|butter milk/.test(n) ||
    categorySlug.includes('beverage'))
    return 'beverage.jpg';
  if (/tandoori|tikka|kebab|kalmi/.test(n) || categorySlug.includes('tandoori'))
    return 'tandoori.jpg';
  if (/curry|masala|dal|palak|kofta|kolhapuri|butter chicken|murg/.test(n) ||
    categorySlug.includes('curry'))
    return 'curry.jpg';
  if (/chicken|drumstick|lollipop|wings|omelette|omlette/.test(n)) return 'chicken.jpg';
  if (categorySlug.includes('starter')) return 'starter.jpg';
  if (categorySlug.includes('veg')) return 'paneer.jpg';
  return 'curry.jpg';
}

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast';
  const port = process.env.PORT ?? '4000';
  const origin = process.env.PUBLIC_API_ORIGIN ?? `http://localhost:${port}`;

  const placeholderDir = join(process.cwd(), 'uploads', 'placeholders');
  const uploadDir = join(process.cwd(), 'uploads');

  await mongoose.connect(uri);

  const Category = mongoose.model(
    'Category',
    new Schema(
      { name: String, slug: String },
      { collection: 'categories' },
    ),
  );
  const MenuItem = mongoose.model(
    'MenuItem',
    new Schema(
      {
        name: String,
        categoryId: Schema.Types.ObjectId,
        imageUrl: String,
        imageAlt: String,
      },
      { collection: 'menu_items' },
    ),
  );

  const categories = await Category.find().lean();
  const byId = new Map(categories.map((c) => [String(c._id), c.slug as string]));

  const items = await MenuItem.find().exec();
  let updated = 0;

  for (const item of items) {
    const slug = byId.get(String(item.categoryId)) ?? '';
    const file = pickImage(slug, item.name ?? '');
    const src = join(placeholderDir, file);
    if (!existsSync(src)) {
      console.warn(`Missing file ${file} for ${item.name}`);
      continue;
    }
    const destName = `mock-${file}`;
    const dest = join(uploadDir, destName);
    if (!existsSync(dest)) {
      copyFileSync(src, dest);
    }
    item.imageUrl = `${origin}/uploads/${destName}`;
    item.imageAlt = PLACEHOLDER_ALT;
    await item.save();
    updated += 1;
  }

  console.log(`Assigned mock images to ${updated} dishes.`);
  console.log('Alt text marks them as temporary demo placeholders.');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
