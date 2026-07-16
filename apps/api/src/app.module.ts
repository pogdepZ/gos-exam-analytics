import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamResultsModule } from './exam-results/exam-results.module';
import { ReportsModule } from './reports/reports.module';
import { RankingsModule } from './rankings/rankings.module';

@Module({
  imports: [ExamResultsModule, ReportsModule, RankingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
