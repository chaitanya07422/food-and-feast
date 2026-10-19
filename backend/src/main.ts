import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { existsSync, mkdirSync } from 'fs';
import helmet from 'helmet';
import { join } from 'path';
import type { NextFunction, Request, Response } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { OBJECT_STORE } from './storage/storage.module';
import type { ObjectStore } from './storage/types';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const trustProxy = Boolean(config.get<boolean>('trustProxy'));
  if (trustProxy) {
    // Required behind nginx / HTTPS so req.secure and cookies work
    app.set('trust proxy', 1);
  }

  const uploadDir = join(
    process.cwd(),
    config.get<string>('uploadDir') ?? './uploads',
  );
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Serve /uploads/* from local disk or OCI Object Storage
  const store = app.get<ObjectStore>(OBJECT_STORE);
  app.use(
    '/uploads',
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      const key = (req.path || '').replace(/^\/+/, '');
      if (!key || key.includes('..')) {
        res.status(404).end();
        return;
      }
      const lower = key.toLowerCase();
      const ext = lower.includes('.') ? lower.slice(lower.lastIndexOf('.')) : '';
      try {
        const stream = await store.openReadStream(`uploads/${key}`);
        res.setHeader(
          'Content-Type',
          CONTENT_TYPES[ext] ?? 'application/octet-stream',
        );
        res.setHeader(
          'Cache-Control',
          'public, max-age=31536000, immutable',
        );
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        stream.on('error', () => {
          if (!res.headersSent) res.status(404).end();
        });
        stream.pipe(res);
      } catch {
        res.status(404).end();
      }
    },
  );

  app.setGlobalPrefix('api/v1');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string[]>('corsOrigin'),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  const env = config.get<string>('nodeEnv');
  console.log(
    `Food and Feast API listening on port ${port} (${env}, trustProxy=${trustProxy})`,
  );
}

void bootstrap();
