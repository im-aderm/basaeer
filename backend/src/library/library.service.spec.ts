import { Test, TestingModule } from '@nestjs/testing';
import { LibraryService } from './library.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LibraryService', () => {
  let service: LibraryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibraryService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              aggregate: jest.fn(),
            },
            borrowRecord: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            libraryFine: {
              create: jest.fn(),
              aggregate: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb({
              book: { update: jest.fn() },
              borrowRecord: { update: jest.fn() },
              libraryFine: { create: jest.fn() },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
