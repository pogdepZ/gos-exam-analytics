import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';

interface ApiResponseSuccess {
  data: {
    registrationNumber: string;
    scores: Record<string, number | null>;
  };
}

interface ApiResponseError {
  error: {
    code: string;
    message: string;
  };
}

describe('ExamResults (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    examResult: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('GET /api/exam-results/:registrationNumber - success', () => {
    const mockDbResult = {
      registrationNumber: '01000001',
      math: 8.4,
      literature: 6.75,
      physics: 6.0,
      chemistry: 5.25,
      biology: 5.0,
    };
    mockPrismaService.examResult.findUnique.mockResolvedValue(mockDbResult);

    return request(app.getHttpServer())
      .get('/api/exam-results/01000001')
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseSuccess;
        expect(body.data.registrationNumber).toBe('01000001');
        expect(body.data.scores['math']).toBe(8.4);
        expect(body.data.scores['physics']).toBe(6.0);
      });
  });

  it('GET /api/exam-results/:registrationNumber - not found', () => {
    mockPrismaService.examResult.findUnique.mockResolvedValue(null);

    return request(app.getHttpServer())
      .get('/api/exam-results/99999999')
      .expect(404)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseError;
        expect(body.error.code).toBe('EXAM_RESULT_NOT_FOUND');
        expect(body.error.message).toContain('No exam result was found');
      });
  });

  it('GET /api/exam-results/:registrationNumber - invalid registration number characters', () => {
    return request(app.getHttpServer())
      .get('/api/exam-results/0100000A')
      .expect(400)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseError;
        expect(body.error.code).toBe('BAD_REQUEST');
        expect(body.error.message).toContain(
          'Registration number must be a numeric string',
        );
      });
  });

  it('GET /api/exam-results/:registrationNumber - empty input or short/long input', () => {
    return request(app.getHttpServer())
      .get('/api/exam-results/123')
      .expect(400)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseError;
        expect(body.error.code).toBe('BAD_REQUEST');
      });
  });

  it('GET /api/exam-results/:registrationNumber - database failure should be masked', () => {
    mockPrismaService.examResult.findUnique.mockRejectedValue(
      new Error('Internal database crash'),
    );

    return request(app.getHttpServer())
      .get('/api/exam-results/01000001')
      .expect(500)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseError;
        expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(body.error.message).toBe('An unexpected error occurred');
      });
  });
});
