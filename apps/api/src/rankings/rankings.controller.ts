import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RankingsService } from './rankings.service';

@Controller('rankings')
@UseInterceptors(CacheInterceptor)
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('group-a')
  async getGroupARankings(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const data = await this.rankingsService.getGroupARankings(limit);
    return { data };
  }
}
