import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Logging middleware that logs request and response information
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  logger.info("Incoming request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    body: req.body,
    headers: req.headers,
  });

  // Capture response data
  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - start;

    // Log response
    logger.info("Outgoing response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      body: body,
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
  });

  next(err);
};
