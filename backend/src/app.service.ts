import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected', // Will be updated when Prisma is connected
      redis: 'not_configured', // Will be updated in future milestones
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
