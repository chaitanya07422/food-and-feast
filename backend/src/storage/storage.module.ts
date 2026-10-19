import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalObjectStore } from './local.store';
import { OciObjectStore } from './oci.store';
import type { ObjectStore } from './types';

export const OBJECT_STORE = Symbol('OBJECT_STORE');

@Global()
@Module({
  providers: [
    LocalObjectStore,
    {
      provide: OBJECT_STORE,
      inject: [ConfigService, LocalObjectStore],
      useFactory: (
        config: ConfigService,
        local: LocalObjectStore,
      ): ObjectStore => {
        const driver = config.get<string>('storageDriver') ?? 'local';
        if (driver === 'oci') {
          return new OciObjectStore(config);
        }
        return local;
      },
    },
  ],
  exports: [OBJECT_STORE],
})
export class StorageModule {}
