/**
 * Usage Monitoring and Analytics Service
 * Tracks usage patterns for cost management and optimization
 */

import type { Env } from '../types/worker.js';

interface UsageEvent {
  timestamp: number;
  ip: string;
  method: string;
  endpoint: string;
  userAgent?: string;
  origin?: string;
  success: boolean;
  responseTime?: number;
  errorCode?: number;
}

interface DailyStats {
  date: string;
  totalRequests: number;
  uniqueIPs: number;
  toolCalls: {
    search_extensions: number;
    get_extension_details: number;
    get_extension_categories: number;
  };
  errors: number;
  avgResponseTime: number;
}

export class MonitoringService {
  private static readonly USAGE_PREFIX = 'usage:';
  private static readonly DAILY_STATS_PREFIX = 'daily_stats:';
  private static readonly MAX_EVENTS_PER_DAY = 1000; // Limit KV writes

  constructor(private env: Env) {}

  async trackRequest(
    request: Request,
    success: boolean,
    responseTime?: number,
    errorCode?: number,
    toolName?: string
  ): Promise<void> {
    const now = Date.now();
    const ip = this.getClientIP(request);
    const url = new URL(request.url);
    
    const event: UsageEvent = {
      timestamp: now,
      ip: ip,
      method: request.method,
      endpoint: url.pathname,
      userAgent: request.headers.get('User-Agent') || undefined,
      origin: request.headers.get('Origin') || undefined,
      success,
      responseTime,
      errorCode
    };

    // Track the event asynchronously (don't block response)
    // Note: In a real Cloudflare Worker, this would be ctx.waitUntil()
    // For now, we'll process synchronously but quickly
    this.processUsageEvent(event, toolName).catch(error => {
      console.error('Failed to process usage event:', error);
    });
  }

  private async processUsageEvent(event: UsageEvent, toolName?: string): Promise<void> {
    try {
      // Update daily statistics
      await this.updateDailyStats(event, toolName);
      
      // Only store detailed events for a sample (to save KV storage costs)
      if (Math.random() < 0.1) { // 10% sampling rate
        await this.storeEvent(event);
      }
      
      // Check for alerts
      await this.checkForAlerts(event);
    } catch (error) {
      console.error('Failed to process usage event:', error);
    }
  }

  private async updateDailyStats(event: UsageEvent, toolName?: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const statsKey = `${MonitoringService.DAILY_STATS_PREFIX}${today}`;
    
    const existing = await this.env.CACHE.get(statsKey);
    let stats: DailyStats;
    
    if (existing) {
      stats = JSON.parse(existing);
    } else {
      stats = {
        date: today,
        totalRequests: 0,
        uniqueIPs: 0,
        toolCalls: {
          search_extensions: 0,
          get_extension_details: 0,
          get_extension_categories: 0
        },
        errors: 0,
        avgResponseTime: 0
      };
    }

    // Update stats
    stats.totalRequests++;
    
    if (!event.success) {
      stats.errors++;
    }
    
    if (event.responseTime) {
      stats.avgResponseTime = (stats.avgResponseTime * (stats.totalRequests - 1) + event.responseTime) / stats.totalRequests;
    }
    
    if (toolName && toolName in stats.toolCalls) {
      (stats.toolCalls as any)[toolName]++;
    }

    // Update unique IPs (simplified - just track a set of IPs for today)
    const ipsKey = `${MonitoringService.DAILY_STATS_PREFIX}ips:${today}`;
    const existingIPs = await this.env.CACHE.get(ipsKey);
    const ipSet = existingIPs ? new Set(JSON.parse(existingIPs)) : new Set();
    const previousSize = ipSet.size;
    ipSet.add(event.ip);
    
    if (ipSet.size > previousSize) {
      stats.uniqueIPs = ipSet.size;
      // Store IP set (with 25-hour TTL)
      await this.env.CACHE.put(ipsKey, JSON.stringify([...ipSet]), { expirationTtl: 90000 });
    }

    // Store updated stats (with 25-hour TTL)
    await this.env.CACHE.put(statsKey, JSON.stringify(stats), { expirationTtl: 90000 });
  }

  private async storeEvent(event: UsageEvent): Promise<void> {
    const eventKey = `${MonitoringService.USAGE_PREFIX}${event.timestamp}:${Math.random().toString(36).substr(2, 9)}`;
    
    // Store event with 7-day TTL
    await this.env.CACHE.put(eventKey, JSON.stringify(event), { expirationTtl: 604800 });
  }

  private async checkForAlerts(event: UsageEvent): Promise<void> {
    // Check for unusual patterns that might indicate abuse
    const hourlyRequestsKey = `hourly_count:${event.ip}:${Math.floor(Date.now() / (60 * 60 * 1000))}`;
    const count = await this.env.CACHE.get(hourlyRequestsKey);
    const requestCount = count ? parseInt(count) + 1 : 1;
    
    await this.env.CACHE.put(hourlyRequestsKey, requestCount.toString(), { expirationTtl: 3600 });
    
    // Alert if IP makes more than 200 requests per hour (potential abuse)
    if (requestCount > 200) {
      console.warn(`High usage alert: IP ${event.ip} made ${requestCount} requests in the current hour`);
    }
    
    // Alert on high error rates
    if (!event.success && event.errorCode && event.errorCode >= 500) {
      console.error(`Server error alert: ${event.errorCode} for ${event.endpoint} from ${event.ip}`);
    }
  }

  async getDailyStats(date?: string): Promise<DailyStats | null> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const statsKey = `${MonitoringService.DAILY_STATS_PREFIX}${targetDate}`;
    
    const stored = await this.env.CACHE.get(statsKey);
    return stored ? JSON.parse(stored) : null;
  }

  async getRecentStats(days: number = 7): Promise<DailyStats[]> {
    const stats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStats = await this.getDailyStats(dateStr);
      if (dayStats) {
        stats.push(dayStats);
      }
    }
    
    return stats.reverse(); // Oldest first
  }

  async getUsageSummary(): Promise<UsageSummary> {
    const today = await this.getDailyStats();
    const recent = await this.getRecentStats(7);
    
    const totalRequests = recent.reduce((sum, day) => sum + day.totalRequests, 0);
    const totalErrors = recent.reduce((sum, day) => sum + day.errors, 0);
    const avgResponseTime = recent.length > 0 
      ? recent.reduce((sum, day) => sum + day.avgResponseTime, 0) / recent.length 
      : 0;
    
    const peakDay = recent.reduce((peak, day) => 
      day.totalRequests > peak.totalRequests ? day : peak, 
      recent[0] || { totalRequests: 0, date: 'N/A' }
    );

    return {
      today: today || {
        date: new Date().toISOString().split('T')[0],
        totalRequests: 0,
        uniqueIPs: 0,
        toolCalls: { search_extensions: 0, get_extension_details: 0, get_extension_categories: 0 },
        errors: 0,
        avgResponseTime: 0
      },
      last7Days: {
        totalRequests,
        totalErrors,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        avgResponseTime,
        peakDay: {
          date: peakDay.date,
          requests: peakDay.totalRequests
        }
      },
      costEstimate: this.estimateCosts(totalRequests, avgResponseTime)
    };
  }

  private estimateCosts(monthlyRequests: number, avgResponseTimeMs: number): CostEstimate {
    // Cloudflare Workers pricing
    const FREE_REQUESTS = 10_000_000;
    const FREE_CPU_MS = 30_000_000;
    const COST_PER_MILLION_REQUESTS = 0.30;
    const COST_PER_MILLION_CPU_MS = 0.02;
    const MINIMUM_MONTHLY = 5.00;

    // Scale 7-day numbers to monthly
    const estimatedMonthlyRequests = (monthlyRequests / 7) * 30;
    const estimatedMonthlyCpuMs = estimatedMonthlyRequests * (avgResponseTimeMs || 3); // Assume 3ms if no data

    let requestCost = 0;
    let cpuCost = 0;
    let minimumFee = 0;

    if (estimatedMonthlyRequests > FREE_REQUESTS) {
      const billableRequests = estimatedMonthlyRequests - FREE_REQUESTS;
      requestCost = (billableRequests / 1_000_000) * COST_PER_MILLION_REQUESTS;
      minimumFee = MINIMUM_MONTHLY;
    }

    if (estimatedMonthlyCpuMs > FREE_CPU_MS) {
      const billableCpuMs = estimatedMonthlyCpuMs - FREE_CPU_MS;
      cpuCost = (billableCpuMs / 1_000_000) * COST_PER_MILLION_CPU_MS;
      minimumFee = MINIMUM_MONTHLY;
    }

    const totalCost = minimumFee + requestCost + cpuCost;

    return {
      estimatedMonthlyRequests: Math.round(estimatedMonthlyRequests),
      estimatedMonthlyCpuMs: Math.round(estimatedMonthlyCpuMs),
      breakdown: {
        minimumFee,
        requestCost,
        cpuCost
      },
      totalMonthlyCost: totalCost,
      withinFreeTier: totalCost <= 0
    };
  }

  private getClientIP(request: Request): string {
    return request.headers.get('CF-Connecting-IP') || 
           request.headers.get('X-Forwarded-For')?.split(',')[0].trim() || 
           request.headers.get('X-Real-IP') || 
           '127.0.0.1';
  }
}

export interface UsageSummary {
  today: DailyStats;
  last7Days: {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    avgResponseTime: number;
    peakDay: {
      date: string;
      requests: number;
    };
  };
  costEstimate: CostEstimate;
}

export interface CostEstimate {
  estimatedMonthlyRequests: number;
  estimatedMonthlyCpuMs: number;
  breakdown: {
    minimumFee: number;
    requestCost: number;
    cpuCost: number;
  };
  totalMonthlyCost: number;
  withinFreeTier: boolean;
}