import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { UnauthorizedError } from '../../utils/errors.js';

export interface AuthenticatedUser extends JwtPayload {
  type?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn('[WARN] Missing authorization header');
      throw new UnauthorizedError('Missing authorization header');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      console.warn('[WARN] Invalid authorization header format');
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const [scheme, token] = parts;

    if (scheme.toLowerCase() !== 'bearer') {
      console.warn('[WARN] Invalid authorization scheme');
      throw new UnauthorizedError('Invalid authorization scheme');
    }

    if (token === config.API_KEY) {
      //suport API key simples
      req.user = { type: 'api-key' };
      return next();
    }

    //validação JWT
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
      next();
    } catch (jwtError) {
      const error = jwtError as Error;
      console.warn(`[WARN] Invalid JWT token: ${error.message}`);
      throw new UnauthorizedError('Invalid or expired token');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    const err = error as Error;
    console.error(`[ERROR] Authentication error: ${err.message}`);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}

export function generateJWT(payload: object = {}): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '24h',
  });
}
