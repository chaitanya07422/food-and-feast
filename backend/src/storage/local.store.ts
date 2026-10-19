import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import type { Readable } from 'stream';
import type { ObjectStore, PutObjectInput, StoredObjectRef } from './types';

@Injectable()
export class LocalObjectStore implements ObjectStore {
  constructor(private readonly config: ConfigService) {}

  private root() {
    const configured = this.config.get<string>('uploadDir') ?? './uploads';
    const dir = join(process.cwd(), configured);
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  async put(input: PutObjectInput): Promise<StoredObjectRef> {
    const absolutePath = join(this.root(), input.key);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, input.body);
    return {
      publicPath: `uploads/${input.key.replace(/^\/+/, '')}`,
      storagePath: `uploads/${input.key.replace(/^\/+/, '')}`,
    };
  }

  async openReadStream(storagePathOrPublicPath: string): Promise<Readable> {
    const key = storagePathOrPublicPath
      .replace(/^\/+/, '')
      .replace(/^uploads\//, '');
    const absolutePath = join(this.root(), key);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('File not found');
    }
    return createReadStream(absolutePath);
  }
}
