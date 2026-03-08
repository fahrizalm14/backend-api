import type { Request } from 'express';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { AppError } from '@/core/errors/AppError';
import type { HttpMiddleware } from '@/core/http/types';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function createRateLimitMiddleware(options: RateLimitOptions): HttpMiddleware {
  const message = options.message ?? 'Too many requests';

  return {
    expressRoute: (req, res, next) => {
      const ip = resolveExpressIp(req);
      const decision = consume(`${options.keyPrefix}:${ip}`, options);

      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', decision.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(decision.resetAt / 1000).toString());
      if (!decision.allowed) {
        res.setHeader('Retry-After', decision.retryAfterSeconds.toString());
        next(new AppError(429, message));
        return;
      }

      next();
    },
    fastifyRoute: async (request: FastifyRequest, reply: FastifyReply) => {
      const ip = resolveFastifyIp(request);
      const decision = consume(`${options.keyPrefix}:${ip}`, options);

      reply.header('X-RateLimit-Limit', options.maxRequests.toString());
      reply.header('X-RateLimit-Remaining', decision.remaining.toString());
      reply.header('X-RateLimit-Reset', Math.ceil(decision.resetAt / 1000).toString());
      if (!decision.allowed) {
        reply.header('Retry-After', decision.retryAfterSeconds.toString());
        throw new AppError(429, message);
      }
    },
  };
}

function consume(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs;
    const fresh: Bucket = { count: 1, resetAt };
    buckets.set(key, fresh);
    maybePruneExpired(now);
    return {
      allowed: true,
      remaining: Math.max(options.maxRequests - fresh.count, 0),
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  current.count += 1;
  const allowed = current.count <= options.maxRequests;
  const remaining = Math.max(options.maxRequests - current.count, 0);

  return {
    allowed,
    remaining,
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
  };
}

function maybePruneExpired(now: number): void {
  if (buckets.size < 10_000) {
    return;
  }

  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function resolveExpressIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }

  return req.ip || 'unknown';
}

function resolveFastifyIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }

  return request.ip || 'unknown';
}
