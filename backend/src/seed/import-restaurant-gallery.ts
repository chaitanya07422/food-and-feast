/**
 * Imports restaurant photos from food-and-feast/assets/restaurant/
 * into MongoDB gallery_images + uploads/gallery/
 *
 * Copy your Downloads/resturent folder contents into assets/restaurant/ first:
 *   cp -R ~/Downloads/resturent/* food-and-feast/assets/restaurant/
 */
import { config as loadEnv } from 'dotenv';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs';
import { basename, extname, join } from 'path';
import mongoose, { Schema } from 'mongoose';

loadEnv();

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast';
  const origin =
    process.env.PUBLIC_API_ORIGIN ??
    `http://localhost:${process.env.PORT ?? '4000'}`;

  const sourceDir = join(process.cwd(), '..', 'assets', 'restaurant');
  // When run from backend/: ../assets/restaurant
  const altSource = join(process.cwd(), 'assets', 'restaurant');
  const dir = existsSync(sourceDir)
    ? sourceDir
    : existsSync(altSource)
      ? altSource
      : sourceDir;

  if (!existsSync(dir)) {
    console.error(`Source folder not found: ${dir}`);
    console.error(
      'Copy restaurant photos into food-and-feast/assets/restaurant/ then re-run.',
    );
    process.exit(1);
  }

  const files = readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(extname(name).toLowerCase()))
    .filter((name) => statSync(join(dir, name)).isFile())
    .sort();

  if (files.length === 0) {
    console.error(`No images found in ${dir}`);
    process.exit(1);
  }

  const uploadDir = join(process.cwd(), 'uploads', 'gallery');
  mkdirSync(uploadDir, { recursive: true });

  await mongoose.connect(uri);
  const GalleryImage = mongoose.model(
    'GalleryImage',
    new Schema(
      {
        title: String,
        imageUrl: String,
        imageAlt: String,
        displayOrder: Number,
        isPublished: Boolean,
      },
      { timestamps: true, collection: 'gallery_images' },
    ),
  );

  await GalleryImage.deleteMany({});

  let order = 0;
  for (const file of files) {
    const safe = `restaurant-${Date.now()}-${order}-${basename(file).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    copyFileSync(join(dir, file), join(uploadDir, safe));
    const title = basename(file, extname(file))
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || `Restaurant photo ${order + 1}`;

    await GalleryImage.create({
      title,
      imageUrl: `${origin}/uploads/gallery/${safe}`,
      imageAlt: `Food & Feast restaurant — ${title}`,
      displayOrder: order,
      isPublished: true,
    });
    order += 1;
  }

  console.log(`Imported ${order} restaurant photos into the gallery.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
