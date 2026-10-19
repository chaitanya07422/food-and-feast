import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { ConfigFileAuthenticationDetailsProvider, Region } from 'oci-common';
import { ObjectStorageClient } from 'oci-objectstorage';
import type { ObjectStore, PutObjectInput, StoredObjectRef } from './types';

const OCI_PREFIX = 'oci:';

function toReadable(value: unknown): Readable {
  if (value instanceof Readable) return value;
  if (Buffer.isBuffer(value)) return Readable.from(value);
  if (value instanceof Uint8Array) return Readable.from(Buffer.from(value));
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { getReader?: unknown }).getReader === 'function'
  ) {
    return Readable.fromWeb(value as NodeWebReadableStream);
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function'
  ) {
    return Readable.from(value as AsyncIterable<unknown>);
  }
  throw new NotFoundException('File not found');
}

@Injectable()
export class OciObjectStore implements ObjectStore {
  private readonly client: ObjectStorageClient;
  private readonly namespace: string;
  private readonly bucket: string;
  private readonly keyPrefix: string;

  constructor(private readonly config: ConfigService) {
    const namespace = this.config.get<string>('oci.namespace');
    const bucket = this.config.get<string>('oci.bucket');
    if (!namespace || !bucket) {
      throw new Error(
        'OCI_NAMESPACE and OCI_BUCKET are required when STORAGE_DRIVER=oci',
      );
    }

    const provider = new ConfigFileAuthenticationDetailsProvider(
      this.config.get<string>('oci.configFile') || undefined,
      this.config.get<string>('oci.profile') || 'DEFAULT',
    );

    this.client = new ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });

    const region = this.config.get<string>('oci.region');
    if (region) {
      this.client.region = Region.fromRegionId(region);
    }

    this.namespace = namespace;
    this.bucket = bucket;
    this.keyPrefix = (
      this.config.get<string>('oci.keyPrefix') ?? 'food-and-feast'
    ).replace(/\/+$/, '');
  }

  private objectName(key: string) {
    const clean = key.replace(/^\/+/, '').replace(/^uploads\//, '');
    return `${this.keyPrefix}/${clean}`;
  }

  async put(input: PutObjectInput): Promise<StoredObjectRef> {
    const objectName = this.objectName(input.key);
    await this.client.putObject({
      namespaceName: this.namespace,
      bucketName: this.bucket,
      objectName,
      putObjectBody: Readable.from(input.body),
      contentLength: input.body.length,
      contentType: input.contentType,
    });

    const publicPath = `uploads/${input.key.replace(/^\/+/, '')}`;
    return {
      publicPath,
      storagePath: `${OCI_PREFIX}${objectName}`,
    };
  }

  async openReadStream(storagePathOrPublicPath: string): Promise<Readable> {
    let objectName: string;
    if (storagePathOrPublicPath.startsWith(OCI_PREFIX)) {
      objectName = storagePathOrPublicPath.slice(OCI_PREFIX.length);
    } else {
      objectName = this.objectName(storagePathOrPublicPath);
    }

    try {
      const response = await this.client.getObject({
        namespaceName: this.namespace,
        bucketName: this.bucket,
        objectName,
      });
      return toReadable(response.value);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
