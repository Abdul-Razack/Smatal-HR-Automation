import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let correlationId = req.headers[CORRELATION_ID_HEADER];
    if (!correlationId) {
      correlationId = uuidv4();
      req.headers[CORRELATION_ID_HEADER] = correlationId;
    }
    // Set the correlation ID on the response header so clients can trace it
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
