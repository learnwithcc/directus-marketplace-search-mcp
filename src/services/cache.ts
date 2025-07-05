/**
 * Cache Service using Cloudflare Workers KV
 * Provides efficient caching for API responses
 */

import type { CacheEntry } from '../types/directus.js';

export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.kv.get(key);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if cache entry is expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        // Entry is expired, delete it and return null
        await this.kv.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds
      };

      await this.kv.put(key, JSON.stringify(entry), {
        expirationTtl: ttlSeconds
      });
    } catch (error) {
      console.error('Cache set error:', error);
      // Don't throw - caching is not critical for functionality
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.kv.get(key);
      return value !== null;
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  // Helper method for cache key generation
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
    
    const paramString = JSON.stringify(sortedParams);
    return `${prefix}:${btoa(paramString)}`;
  }

  // Clear cache entries by prefix (useful for invalidation)
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      // Note: KV doesn't support prefix-based deletion out of the box
      // This would require maintaining a list of keys for each prefix
      // For now, we'll just log the intention
      console.log(`Cache clear by prefix requested: ${prefix}`);
    } catch (error) {
      console.error('Cache clear by prefix error:', error);
    }
  }
}