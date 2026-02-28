export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public isCatastrophic: boolean;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isCatastrophic = statusCode >= 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', details: Record<string, unknown> = {}) {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
    this.details = details;
    this.isCatastrophic = false;
  }
}
