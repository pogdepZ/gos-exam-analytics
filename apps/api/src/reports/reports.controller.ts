import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseInterceptors(CacheInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('score-distribution')
  async getScoreDistribution() {
    const result = await this.reportsService.getScoreDistribution();
    return { data: result };
  }
}
