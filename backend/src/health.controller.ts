import { Controller, Get } from '@nestjs/common';

/**
 * Health check endpoint for Render load balancer.
 * Responds to GET /api/health with a 200 status.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
