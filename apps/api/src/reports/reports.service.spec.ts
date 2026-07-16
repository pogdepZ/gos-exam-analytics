import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectRegistry } from '../subjects/subject-registry.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockPrismaService = {
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        SubjectRegistry,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScoreDistribution', () => {
    it('should query and return distribution mapped correctly', async () => {
      // Mock db response (with mixed number and string from PostgreSQL BigInt stringification)
      const mockQueryResponse = [
        {
          math_GTE_8: 10,
          math_GTE_6_LT_8: 20,
          math_GTE_4_LT_6: 30,
          math_LT_4: 40,
          physics_GTE_8: '5',
          physics_GTE_6_LT_8: '15',
          physics_GTE_4_LT_6: '25',
          physics_LT_4: '35',
        },
      ];

      mockPrismaService.$queryRawUnsafe.mockResolvedValue(mockQueryResponse);

      const result = await service.getScoreDistribution();

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalled();

      const mathReport = result.find((r) => r.subject === 'math');
      expect(mathReport).toBeDefined();
      expect(mathReport?.levels).toEqual({
        GTE_8: 10,
        GTE_6_LT_8: 20,
        GTE_4_LT_6: 30,
        LT_4: 40,
      });

      const physicsReport = result.find((r) => r.subject === 'physics');
      expect(physicsReport).toBeDefined();
      expect(physicsReport?.levels).toEqual({
        GTE_8: 5,
        GTE_6_LT_8: 15,
        GTE_4_LT_6: 25,
        LT_4: 35,
      });
    });

    it('should return default counts when database query is empty', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.getScoreDistribution();

      const mathReport = result.find((r) => r.subject === 'math');
      expect(mathReport?.levels).toEqual({
        GTE_8: 0,
        GTE_6_LT_8: 0,
        GTE_4_LT_6: 0,
        LT_4: 0,
      });
    });
  });
});
