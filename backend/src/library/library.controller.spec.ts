import { Test, TestingModule } from '@nestjs/testing';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LibraryController', () => {
  let controller: LibraryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryController],
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

    controller = module.get<LibraryController>(LibraryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
