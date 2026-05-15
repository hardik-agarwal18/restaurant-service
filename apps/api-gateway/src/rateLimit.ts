import { RateLimiterRedis } from "rate-limiter-flexible";
import { Redis } from "ioredis";
import type { NextFunction, Request, Response } from "express";

export function createRateLimiter(redisUrl: string) {
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rlflx",
    points: 120,
    duration: 60,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || req.socket.remoteAddress || "unknown";
      await limiter.consume(key);
      next();
    } catch {
      res.status(429).json({ error: "RATE_LIMITED" });
    }
  };
}
