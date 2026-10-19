import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { extname } from 'path';
import { OBJECT_STORE } from '../storage/storage.module';
import type { ObjectStore } from '../storage/types';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class UploadsService {
  constructor(
    private readonly config: ConfigService,
    @Inject(OBJECT_STORE) private readonly store: ObjectStore,
  ) {}

  async saveImage(file: Express.Multer.File) {
    const fromName = extname(file.originalname).toLowerCase();
    const ext = EXT_BY_MIME[file.mimetype] ?? (fromName || '.jpg');
    const hash = createHash('sha256')
      .update(file.buffer)
      .digest('hex')
      .slice(0, 10);
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${hash}${ext}`;

    const stored = await this.store.put({
      key: filename,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const publicBase = (
      this.config.get<string>('publicApiOrigin') ??
      `http://localhost:${this.config.get<number>('port') ?? 4000}`
    ).replace(/\/+$/, '');

    return {
      url: `${publicBase}/${stored.publicPath}`,
      filename,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: stored.storagePath,
    };
  }
}
