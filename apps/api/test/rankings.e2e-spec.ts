import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';

interface ApiResponseSuccess {
  data: Array<{
    registrationNumber: string;
    totalScore: number;
    scores: {
      math: number;
      physics: number;
      chemistry: number;
    };
  }>;
}

describe('Rankings (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
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
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('GET /api/rankings/group-a - success', () => {
    const mockDbResult = [
      {
        registrationNumber: '01000001',
        math: 9.0,
        physics: 9.5,
        chemistry: 8.5,
        totalScore: 27.0,
      },
    ];
    mockPrismaService.$queryRaw.mockResolvedValue(mockDbResult);

    return request(app.getHttpServer())
      .get('/api/rankings/group-a?limit=1')
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseSuccess;
        expect(body.data).toHaveLength(1);
        expect(body.data[0].registrationNumber).toBe('01000001');
        expect(body.data[0].totalScore).toBe(27.0);
        expect(body.data[0].scores.math).toBe(9.0);
      });
  });
});
