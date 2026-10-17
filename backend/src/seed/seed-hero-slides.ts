/**
 * Seeds four homepage hero slides.
 * Prefers existing local mock food images + a restaurant gallery upload when present.
 */
import { config as loadEnv } from 'dotenv';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import mongoose, { Schema } from 'mongoose';

loadEnv();

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast';
  const origin =
    process.env.PUBLIC_API_ORIGIN ??
    `http://localhost:${process.env.PORT ?? '4000'}`;

  const uploads = join(process.cwd(), 'uploads');
  const galleryDir = join(uploads, 'gallery');

  let ambienceFile: string | null = null;
  if (existsSync(galleryDir)) {
    const files = readdirSync(galleryDir).filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f),
    );
    if (files.length) ambienceFile = files[0];
  }

  // Fall back to a restaurant root upload if gallery empty
  if (!ambienceFile && existsSync(uploads)) {
    const root = readdirSync(uploads).filter(
      (f) => /^\d+-.*\.(jpe?g|png|webp)$/i.test(f),
    );
    if (root.length) ambienceFile = root[0];
  }

  const slides = [
    {
      title: 'Biryani',
      file: 'mock-biryani.jpg',
      alt: 'Temporary hero photo — fragrant biryani. Replace in Admin → Hero.',
      inGallery: false,
    },
    {
      title: 'Tandoori',
      file: 'mock-tandoori.jpg',
      alt: 'Temporary hero photo — tandoori dishes. Replace in Admin → Hero.',
      inGallery: false,
    },
    {
      title: 'Curry & naan',
      file: 'mock-curry.jpg',
      alt: 'Temporary hero photo — Indian curry. Replace in Admin → Hero.',
      inGallery: false,
    },
    {
      title: 'Restaurant ambience',
      file: ambienceFile ?? 'mock-starter.jpg',
      alt: ambienceFile
        ? 'Food & Feast restaurant ambience'
        : 'Temporary hero photo — restaurant ambience. Replace in Admin → Hero.',
      inGallery: Boolean(ambienceFile && existsSync(join(galleryDir, ambienceFile))),
    },
  ];

  for (const slide of slides) {
    const path = slide.inGallery
      ? join(galleryDir, slide.file)
      : join(uploads, slide.file);
    if (!existsSync(path) && !slide.inGallery) {
      console.warn(`Missing ${slide.file} — run seed:images first if needed`);
    }
  }

  await mongoose.connect(uri);
  const HeroSlide = mongoose.model(
    'HeroSlide',
    new Schema(
      {
        title: String,
        imageUrl: String,
        imageAlt: String,
        displayOrder: Number,
        isActive: Boolean,
      },
      { timestamps: true, collection: 'hero_slides' },
    ),
  );

  await HeroSlide.deleteMany({});

  await HeroSlide.insertMany(
    slides.map((s, i) => ({
      title: s.title,
      imageUrl: s.inGallery
        ? `${origin}/uploads/gallery/${s.file}`
        : `${origin}/uploads/${s.file}`,
      imageAlt: s.alt,
      displayOrder: i,
      isActive: true,
    })),
  );

  console.log(`Seeded ${slides.length} hero slides.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
