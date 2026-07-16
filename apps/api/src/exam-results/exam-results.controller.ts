import { Controller, Get, Param } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { IsNotEmpty, Matches } from 'class-validator';

export class FindOneParams {
  @IsNotEmpty()
  @Matches(/^\d{6,12}$/, {
    message:
      'Registration number must be a numeric string between 6 and 12 digits',
  })
  registrationNumber: string;
}

@Controller('exam-results')
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  @Get(':registrationNumber')
  async findOne(@Param() params: FindOneParams) {
    const result = await this.examResultsService.findByRegistrationNumber(
      params.registrationNumber,
    );
    return { data: result };
  }
}
