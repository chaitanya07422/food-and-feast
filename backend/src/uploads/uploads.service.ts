import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { OBJECT_STORE } from '../storage/storage.module';
import type { ObjectStore } from '../storage/types';
import { optimizeImageForWeb } from './image-optimize';

@Injectable()
export class UploadsService {
  constructor(
    private readonly config: ConfigService,
    @Inject(OBJECT_STORE) private readonly store: ObjectStore,
  ) {}

  async saveImage(file: Express.Multer.File) {
    const optimized = await optimizeImageForWeb(file.buffer, file.mimetype);
    const hash = createHash('sha256')
      .update(optimized.buffer)
      .digest('hex')
      .slice(0, 10);
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${hash}${optimized.ext}`;

    const stored = await this.store.put({
      key: filename,
      body: optimized.buffer,
      contentType: optimized.contentType,
    });

    const publicBase = (
      this.config.get<string>('publicApiOrigin') ??
      `http://localhost:${this.config.get<number>('port') ?? 4000}`
    ).replace(/\/+$/, '');

    return {
      url: `${publicBase}/${stored.publicPath}`,
      filename,
      mimeType: optimized.contentType,
      size: optimized.buffer.length,
      storagePath: stored.storagePath,
    };
  }
}
