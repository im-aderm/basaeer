import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockHttpAdapterHost: HttpAdapterHost;
  let mockHttpAdapter: any;

  beforeEach(() => {
    mockHttpAdapter = {
      getRequestUrl: jest.fn().mockReturnValue('/test'),
      reply: jest.fn(),
    };
    mockHttpAdapterHost = {
      httpAdapter: mockHttpAdapter,
    } as HttpAdapterHost;
    filter = new AllExceptionsFilter(mockHttpAdapterHost);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch and format HttpException', () => {
    const mockResponse = {};
    const mockCtx = {
      getRequest: jest.fn(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockCtx),
    } as any;

    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    filter.catch(exception, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      }),
      HttpStatus.FORBIDDEN,
    );
  });

  it('should mask internal server errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const mockResponse = {};
    const mockCtx = {
      getRequest: jest.fn(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockCtx),
    } as any;

    const exception = new Error('Database connection failed');
    filter.catch(exception, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred. Please contact support.',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    process.env.NODE_ENV = originalEnv;
  });
});
