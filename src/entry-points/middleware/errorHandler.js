import { AppError } from '../../utils/errors.js';

export function errorHandlerMiddleware(err, req, res, _next) {
  console.error(`[ERROR] ${err.message}`, {
    code: err.code,
    statusCode: err.statusCode,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details && { details: err.details }),
      },
    });
  }


  
  if (err.isCatastrophic !== false) {
    console.error('[ERROR] Catastrophic error - restarting process');
    process.exit(1);
  }

  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
