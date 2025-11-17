import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  getWelcome() {
    return {
      message: '🎵 Welcome to Cameroon Music Industry Platform API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    };
  }
}
