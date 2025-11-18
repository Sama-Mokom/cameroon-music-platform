import { Injectable } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';
import { RedisService } from './common/redis/redis.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getHealth() {
    const isDatabaseHealthy = await this.prisma.isHealthy();
    const isRedisHealthy = this.redis.isHealthy();

    return {
      status: isDatabaseHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDatabaseHealthy ? 'connected' : 'disconnected',
      redis: isRedisHealthy ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
