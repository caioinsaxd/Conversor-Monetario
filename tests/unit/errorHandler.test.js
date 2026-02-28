import { describe, it, expect, beforeEach } from '@jest/globals';
import { errorHandlerMiddleware } from '../../src/entry-points/middleware/errorHandler.js';
import { AppError, ExternalServiceError } from '../../src/utils/errors.js';

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockExit;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  describe('AppError instances', () => {
    it('should handle AppError with details', () => {
      const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      error.details = { field: 'value' };

      errorHandlerMiddleware(error, mockReq, mockRes, mockNext);

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

      errorHandlerMiddleware(error, mockReq, mockRes, mockNext);

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

      errorHandlerMiddleware(error, mockReq, mockRes, mockNext);

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
      error.isCatastrophic = false;

      errorHandlerMiddleware(error, mockReq, mockRes, mockNext);

      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('AsyncHandler', () => {
    it('should wrap async functions and catch errors', async () => {
      const { asyncHandler } = await import('../../src/entry-points/middleware/errorHandler.js');
      
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const asyncFn = asyncHandler(async (req, res, next) => {
        throw new Error('Async error');
      });

      await asyncFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
