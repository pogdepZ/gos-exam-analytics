import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';

interface ApiResponseSuccess {
  data: Array<{
    subject: string;
    label: string;
    levels: {
      GTE_8: number;
      GTE_6_LT_8: number;
      GTE_4_LT_6: number;
      LT_4: number;
    };
  }>;
}

describe('Reports (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    $queryRawUnsafe: jest.fn(),
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

  it('GET /api/reports/score-distribution - success', () => {
    const mockDbResult = [
      {
        math_GTE_8: 100,
        math_GTE_6_LT_8: 200,
        math_GTE_4_LT_6: 150,
        math_LT_4: 50,
      },
    ];
    mockPrismaService.$queryRawUnsafe.mockResolvedValue(mockDbResult);

    return request(app.getHttpServer())
      .get('/api/reports/score-distribution')
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as ApiResponseSuccess;
        expect(body.data).toBeDefined();
        const math = body.data.find((item) => item.subject === 'math');
        expect(math).toBeDefined();
        expect(math?.levels.GTE_8).toBe(100);
        expect(math?.levels.LT_4).toBe(50);
      });
  });
});
