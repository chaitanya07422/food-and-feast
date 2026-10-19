import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

const DEFAULT_MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: memoryStorage(),
        limits: {
          fileSize:
            config.get<number>('maxUploadBytes') ?? DEFAULT_MAX_UPLOAD_BYTES,
        },
        fileFilter: (
          _req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, acceptFile: boolean) => void,
        ) => {
          const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ];
          if (!allowed.includes(file.mimetype)) {
            return cb(
              new Error('Only JPEG, PNG, WebP, or GIF images are allowed'),
              false,
            );
          }
          cb(null, true);
        },
      }),
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
