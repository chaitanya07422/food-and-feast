import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  getHealth() {
    const dbReady = this.connection.readyState === 1;
    return {
      status: dbReady ? 'ok' : 'degraded',
      service: 'food-and-feast-api',
      mongodb: dbReady ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
