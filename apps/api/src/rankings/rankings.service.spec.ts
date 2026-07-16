import { Test, TestingModule } from '@nestjs/testing';
import { RankingsService } from './rankings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RankingsService', () => {
  let service: RankingsService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RankingsService>(RankingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGroupARankings', () => {
    it('should query and return rankings sorted correctly', async () => {
      const mockDbResponse = [
        {
          registrationNumber: '01000001',
          math: 9.0,
          physics: 9.5,
          chemistry: 8.5,
          totalScore: 27.0,
        },
        {
          registrationNumber: '01000002',
          math: 8.0,
          physics: 8.0,
          chemistry: 8.0,
          totalScore: 24.0,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockDbResponse);

      const result = await service.getGroupARankings(10);

      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].registrationNumber).toBe('01000001');
      expect(result[0].totalScore).toBe(27.0);
      expect(result[0].scores).toEqual({
        math: 9.0,
        physics: 9.5,
        chemistry: 8.5,
      });
    });

    it('should return empty list when no student is found', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.getGroupARankings();
      expect(result).toEqual([]);
    });
  });
});
