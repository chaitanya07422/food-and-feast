/**
 * Clears mock / temporary dish, gallery, and hero image references from MongoDB.
 * Safe to run before production deploy if the DB was used with local seed photos.
 */
import { config as loadEnv } from 'dotenv';
import mongoose from 'mongoose';

loadEnv();

const MOCK_ALT = /temporary|mock|demo|placeholder/i;
const MOCK_URL = /\/placeholders\/|mock-|placeholder/i;

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');

  const match = {
    $or: [
      { imageAlt: MOCK_ALT },
      { imageUrl: MOCK_URL },
    ],
  };

  const menu = await db
    .collection('menu_items')
    .updateMany(match, { $unset: { imageUrl: '', imageAlt: '' } });
  const gallery = await db
    .collection('gallery_images')
    .updateMany(match, { $unset: { imageUrl: '', imageAlt: '' } });
  const hero = await db
    .collection('hero_slides')
    .updateMany(match, { $unset: { imageUrl: '', imageAlt: '' } });

  console.log(
    `Cleared mock image refs — menu: ${menu.modifiedCount}, gallery: ${gallery.modifiedCount}, hero: ${hero.modifiedCount}`,
  );
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
