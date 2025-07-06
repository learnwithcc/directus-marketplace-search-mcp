/**
 * Rate Limiting Service for MCP Server
 * Implements IP-based rate limiting using Cloudflare Workers KV
 */

import type { Env } from '../types/worker.js';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export class RateLimiterService {
  private static readonly RATE_LIMIT_PREFIX = 'ratelimit:';
  private static readonly HOUR_MS = 60 * 60 * 1000;
  private static readonly DAY_MS = 24 * 60 * 60 * 1000;

  constructor(private env: Env) {}

  private getRequestsPerHour(): number {
    // Check if rate limiting is explicitly disabled
    if (this.env.DISABLE_RATE_LIMITING === 'true') {
      return Infinity;
    }
    
    // Default limits for public server
    if (this.env.ENVIRONMENT === 'development') {
      return 100; // Use limits on our public development server
    }
    
    // For other deployments (user's own), default to unlimited
    return Infinity;
  }

  private getRequestsPerDay(): number {
    // Check if rate limiting is explicitly disabled
    if (this.env.DISABLE_RATE_LIMITING === 'true') {
      return Infinity;
    }
    
    // Default limits for public server
    if (this.env.ENVIRONMENT === 'development') {
      return 500; // Use limits on our public development server
    }
    
    // For other deployments (user's own), default to unlimited
    return Infinity;
  }

  async checkRateLimit(clientIP: string): Promise<RateLimitResult> {
    const now = Date.now();
    const hourlyLimit = this.getRequestsPerHour();
    const dailyLimit = this.getRequestsPerDay();
    
    // If limits are infinite (self-hosted), always allow
    if (hourlyLimit === Infinity && dailyLimit === Infinity) {
      return {
        allowed: true,
        reason: null,
        resetTime: now + RateLimiterService.HOUR_MS,
        remaining: Infinity,
        limit: Infinity
      };
    }
    
    // Check hourly limit
    const hourlyKey = `${RateLimiterService.RATE_LIMIT_PREFIX}hourly:${clientIP}`;
    const hourlyResult = await this.checkLimit(
      hourlyKey,
      hourlyLimit,
      RateLimiterService.HOUR_MS,
      now
    );
    
    if (!hourlyResult.allowed) {
      return {
        allowed: false,
        reason: 'hourly_limit_exceeded',
        resetTime: hourlyResult.resetTime,
        remaining: 0,
        limit: hourlyLimit
      };
    }

    // Check daily limit
    const dailyKey = `${RateLimiterService.RATE_LIMIT_PREFIX}daily:${clientIP}`;
    const dailyResult = await this.checkLimit(
      dailyKey,
      dailyLimit,
      RateLimiterService.DAY_MS,
      now
    );
    
    if (!dailyResult.allowed) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        resetTime: dailyResult.resetTime,
        remaining: 0,
        limit: dailyLimit
      };
    }

    // Both limits passed, increment counters
    await this.incrementCounter(hourlyKey, hourlyResult.entry, RateLimiterService.HOUR_MS);
    await this.incrementCounter(dailyKey, dailyResult.entry, RateLimiterService.DAY_MS);

    return {
      allowed: true,
      reason: null,
      resetTime: hourlyResult.resetTime,
      remaining: hourlyLimit - hourlyResult.entry.count - 1,
      limit: hourlyLimit
    };
  }

  private async checkLimit(
    key: string,
    limit: number,
    windowMs: number,
    now: number
  ): Promise<{allowed: boolean; resetTime: number; entry: RateLimitEntry}> {
    const stored = await this.env.CACHE.get(key);
    
    let entry: RateLimitEntry;
    if (stored) {
      entry = JSON.parse(stored);
      
      // Check if window has expired
      if (now >= entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + windowMs,
          firstRequest: now
        };
      }
    } else {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        firstRequest: now
      };
    }

    const allowed = entry.count < limit;
    
    return {
      allowed,
      resetTime: entry.resetTime,
      entry
    };
  }

  private async incrementCounter(
    key: string,
    entry: RateLimitEntry,
    ttlMs: number
  ): Promise<void> {
    entry.count++;
    
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    await this.env.CACHE.put(key, JSON.stringify(entry), {
      expirationTtl: ttlSeconds
    });
  }

  getClientIP(request: Request): string {
    // Try different headers for client IP
    const cfConnectingIP = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIP = request.headers.get('X-Real-IP');
    
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
      return xRealIP;
    }
    
    // Fallback to a default (shouldn't happen in Cloudflare Workers)
    return '127.0.0.1';
  }

  async getUsageStats(clientIP: string): Promise<UsageStats> {
    const now = Date.now();
    const hourlyLimit = this.getRequestsPerHour();
    const dailyLimit = this.getRequestsPerDay();
    
    const hourlyKey = `${RateLimiterService.RATE_LIMIT_PREFIX}hourly:${clientIP}`;
    const dailyKey = `${RateLimiterService.RATE_LIMIT_PREFIX}daily:${clientIP}`;
    
    const [hourlyStored, dailyStored] = await Promise.all([
      this.env.CACHE.get(hourlyKey),
      this.env.CACHE.get(dailyKey)
    ]);
    
    const hourlyEntry: RateLimitEntry = hourlyStored 
      ? JSON.parse(hourlyStored) 
      : { count: 0, resetTime: now + RateLimiterService.HOUR_MS, firstRequest: now };
      
    const dailyEntry: RateLimitEntry = dailyStored 
      ? JSON.parse(dailyStored) 
      : { count: 0, resetTime: now + RateLimiterService.DAY_MS, firstRequest: now };
    
    return {
      hourly: {
        used: hourlyEntry.count,
        limit: hourlyLimit,
        remaining: hourlyLimit === Infinity ? Infinity : Math.max(0, hourlyLimit - hourlyEntry.count),
        resetTime: hourlyEntry.resetTime
      },
      daily: {
        used: dailyEntry.count,
        limit: dailyLimit,
        remaining: dailyLimit === Infinity ? Infinity : Math.max(0, dailyLimit - dailyEntry.count),
        resetTime: dailyEntry.resetTime
      }
    };
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason: 'hourly_limit_exceeded' | 'daily_limit_exceeded' | null;
  resetTime: number;
  remaining: number;
  limit: number;
}

export interface UsageStats {
  hourly: {
    used: number;
    limit: number;
    remaining: number;
    resetTime: number;
  };
  daily: {
    used: number;
    limit: number;
    remaining: number;
    resetTime: number;
  };
}