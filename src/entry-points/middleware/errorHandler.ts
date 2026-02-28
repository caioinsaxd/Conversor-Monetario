import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors.js';

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  _res: Response,
  _next: NextFunction,
): void {
  const appError = err as AppError;
  console.error(`[ERROR] ${err.message}`, {
    code: appError.code,
    statusCode: appError.statusCode,
  });

  if (err instanceof AppError) {
    const response: { error: { message: string; code: string; details?: unknown } } = {
      error: {
        message: err.message,
        code: err.code,
      },
    };
    if (err.details) {
      response.error.details = err.details;
    }
    _res.status(err.statusCode).json(response);
    return;
  }

  if (appError.isCatastrophic !== false) {
    console.error('[ERROR] Catastrophic error - restarting process');
    process.exit(1);
  }

  _res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}

export function asyncHandler(
  fn: (_req: Request, _res: Response, _next: NextFunction) => Promise<void>,
): (_req: Request, _res: Response, _next: NextFunction) => void {
  return (_req: Request, _res: Response, _next: NextFunction): void => {
    Promise.resolve(fn(_req, _res, _next)).catch(_next);
  };
}
