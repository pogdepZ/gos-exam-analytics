import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamResultsModule } from './exam-results/exam-results.module';
import { ReportsModule } from './reports/reports.module';
import { RankingsModule } from './rankings/rankings.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 86400000, // 24 hours in ms — data is static
    }),
    ExamResultsModule,
    ReportsModule,
    RankingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
