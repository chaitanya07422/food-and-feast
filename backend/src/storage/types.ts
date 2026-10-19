import type { Readable } from 'node:stream';

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StoredObjectRef {
  /** Relative public path, e.g. uploads/abc.jpg — served at /uploads/... */
  publicPath: string;
  /** Driver-specific key for reads (local relative path or oci:key). */
  storagePath: string;
}

export interface ObjectStore {
  put(input: PutObjectInput): Promise<StoredObjectRef>;
  openReadStream(storagePathOrPublicPath: string): Promise<Readable>;
}
