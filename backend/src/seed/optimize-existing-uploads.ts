/**
 * One-shot: recompress every imageUrl in hero / gallery / menu collections.
 *
 * Usage (API host, app root with .env loaded):
 *   npm run optimize:uploads
 */
import { config as loadEnv } from 'dotenv';
import { createHash, randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { OBJECT_STORE } from '../storage/storage.module';
import type { ObjectStore } from '../storage/types';
import { optimizeImageForWeb } from '../uploads/image-optimize';

loadEnv({ path: resolve(process.cwd(), '.env') });
loadEnv({
  path: resolve(process.cwd(), '../shared/.env'),
});

const COLLECTIONS = ['hero_slides', 'gallery_images', 'menu_items'] as const;

async function main() {
  const mongoUri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-and-feast';
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('No database');

  const urls = new Set<string>();
  for (const name of COLLECTIONS) {
    const docs = await db
      .collection(name)
      .find({ imageUrl: { $type: 'string', $ne: '' } })
      .project({ imageUrl: 1 })
      .toArray();
    for (const doc of docs) {
      if (
        typeof doc.imageUrl === 'string' &&
        doc.imageUrl.includes('/uploads/')
      ) {
        urls.add(doc.imageUrl);
      }
    }
  }

  console.log(`Found ${urls.size} unique image URLs`);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const store = app.get<ObjectStore>(OBJECT_STORE);

  for (const url of urls) {
    const key = url.split('/uploads/').pop();
    if (!key || key.includes('..')) {
      console.warn('skip bad url', url);
      continue;
    }

    let input: Buffer;
    try {
      const stream = await store.openReadStream(`uploads/${key}`);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      input = Buffer.concat(chunks);
    } catch (err) {
      console.warn('missing', key, err);
      continue;
    }

    const before = input.length;
    if (before < 350_000) {
      console.log(`ok (already small ${(before / 1024).toFixed(0)}KB): ${key}`);
      continue;
    }

    const lower = key.toLowerCase();
    const mime = lower.endsWith('.png')
      ? 'image/png'
      : lower.endsWith('.webp')
        ? 'image/webp'
        : lower.endsWith('.gif')
          ? 'image/gif'
          : 'image/jpeg';

    const optimized = await optimizeImageForWeb(input, mime);
    if (optimized.buffer.length >= before * 0.95) {
      console.log(
        `skip (no gain): ${key} ${(before / 1024).toFixed(0)}KB → ${(optimized.buffer.length / 1024).toFixed(0)}KB`,
      );
      continue;
    }

    const sameExt = lower.endsWith(optimized.ext);
    let newKey = key;
    if (!sameExt) {
      const hash = createHash('sha256')
        .update(optimized.buffer)
        .digest('hex')
        .slice(0, 10);
      newKey = `${Date.now()}-${randomUUID().slice(0, 8)}-${hash}${optimized.ext}`;
    }

    await store.put({
      key: newKey,
      body: optimized.buffer,
      contentType: optimized.contentType,
    });

    const newUrl = url.replace(`/uploads/${key}`, `/uploads/${newKey}`);
    if (newUrl !== url) {
      for (const name of COLLECTIONS) {
        const res = await db
          .collection(name)
          .updateMany({ imageUrl: url }, { $set: { imageUrl: newUrl } });
        if (res.modifiedCount) {
          console.log(`updated ${name} x${res.modifiedCount}`);
        }
      }
    }

    console.log(
      `optimized ${key} → ${newKey}: ${(before / 1024).toFixed(0)}KB → ${(optimized.buffer.length / 1024).toFixed(0)}KB`,
    );
  }

  await app.close();
  await mongoose.disconnect();
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
