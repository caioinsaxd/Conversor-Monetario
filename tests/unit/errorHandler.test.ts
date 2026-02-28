import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandlerMiddleware, asyncHandler } from '../../src/entry-points/middleware/errorHandler.js';
import { AppError, ExternalServiceError } from '../../src/utils/errors.js';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockExit: jest.SpyInstance;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    mockExit = jest.spyOn(process, 'exit').mockImplementation(((code: any) => code) as any);
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  describe('AppError instances', () => {
    it('should handle AppError with details', () => {
      const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      (error as AppError & { details: unknown }).details = { field: 'value' };

      errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { field: 'value' },
        },
      });
    });

    it('should handle ExternalServiceError', () => {
      const error = new ExternalServiceError('External service failed', {
        originalError: 'Connection timeout',
      });

      errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: 'External service failed',
          code: 'EXTERNAL_SERVICE_ERROR',
          details: { originalError: 'Connection timeout' },
        },
      });
    });
  });

  describe('Non-AppError instances', () => {
    it('should handle generic errors (non-AppError)', () => {
      const error = new Error('Something went wrong');

      errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    });

    it('should not call process.exit for non-catastrophic errors', () => {
      const error = new Error('Non-critical error');
      (error as AppError).isCatastrophic = false;

      errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('AsyncHandler', () => {
    it('should wrap async functions and catch errors', async () => {
      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const mockNext = jest.fn();

      const asyncFn = asyncHandler(async (_req: Request, _res: Response, _next: NextFunction) => {
        throw new Error('Async error');
      });

      await asyncFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
