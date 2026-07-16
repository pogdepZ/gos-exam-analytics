import { Test, TestingModule } from '@nestjs/testing';
import { ExamResultsService } from './exam-results.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectRegistry } from '../subjects/subject-registry.service';
import { NotFoundException } from '@nestjs/common';

describe('ExamResultsService', () => {
  let service: ExamResultsService;

  const mockPrismaService = {
    examResult: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamResultsService,
        SubjectRegistry,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExamResultsService>(ExamResultsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByRegistrationNumber', () => {
    it('should find student and return their scores mapped correctly', async () => {
      const mockResult = {
        registrationNumber: '01000001',
        math: 8.4,
        literature: 6.75,
        foreignLanguage: 8.0,
        physics: 6.0,
        chemistry: 5.25,
        biology: 5.0,
        history: null,
        geography: null,
        civicEducation: null,
        foreignLanguageCode: 'N1',
      };

      mockPrismaService.examResult.findUnique.mockResolvedValue(mockResult);

      const result = await service.findByRegistrationNumber('01000001');

      expect(mockPrismaService.examResult.findUnique).toHaveBeenCalledWith({
        where: { registrationNumber: '01000001' },
      });
      expect(result.registrationNumber).toBe('01000001');
      expect(result.scores.math).toBe(8.4);
      expect(result.scores.literature).toBe(6.75);
      expect(result.scores.history).toBeNull();
    });

    it('should pad registration numbers with leading zeros to 8 digits', async () => {
      const mockResult = {
        registrationNumber: '00012345',
        math: 8.4,
      };
      mockPrismaService.examResult.findUnique.mockResolvedValue(mockResult);

      const result = await service.findByRegistrationNumber('12345');

      expect(mockPrismaService.examResult.findUnique).toHaveBeenCalledWith({
        where: { registrationNumber: '00012345' },
      });
      expect(result.registrationNumber).toBe('00012345');
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockPrismaService.examResult.findUnique.mockResolvedValue(null);

      await expect(
        service.findByRegistrationNumber('99999999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate other database errors directly', async () => {
      mockPrismaService.examResult.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.findByRegistrationNumber('01000001'),
      ).rejects.toThrow('Database connection failed');
    });
  });
});
