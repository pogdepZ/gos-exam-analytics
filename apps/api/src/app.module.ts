import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamResultsModule } from './exam-results/exam-results.module';

@Module({
  imports: [ExamResultsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
