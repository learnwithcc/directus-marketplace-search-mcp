/**
 * Directus Marketplace Search MCP Server
 * Deployed on Cloudflare Workers with simplified MCP implementation
 */

import type { Env } from './types/worker.js';
import { SimpleMCPServer } from './mcp-simple.js';
import { RateLimiterService } from './services/rate-limiter.js';
import { MonitoringService } from './services/monitoring.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // Handle CORS preflight for all endpoints
      if (request.method === 'OPTIONS') {
        const origin = request.headers.get('Origin');
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Expose-Headers': '*',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin',
          }
        });
      }

      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Usage statistics endpoint
      if (url.pathname === '/usage') {
        const rateLimiter = new RateLimiterService(env);
        const clientIP = rateLimiter.getClientIP(request);
        const stats = await rateLimiter.getUsageStats(clientIP);
        
        return new Response(JSON.stringify({
          ip: clientIP,
          usage: stats,
          upgradeMessage: 'For unlimited access, deploy your own instance using our template',
          deployUrl: 'https://github.com/learnwithcc/directus-marketplace-search-mcp'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Admin monitoring endpoint (basic auth could be added here)
      if (url.pathname === '/admin/stats') {
        const monitoring = new MonitoringService(env);
        const summary = await monitoring.getUsageSummary();
        
        return new Response(JSON.stringify({
          summary,
          serverInfo: {
            version: '1.0.0',
            deployment: 'cloudflare-workers',
            timestamp: new Date().toISOString()
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // MCP endpoint - Streamable HTTP transport (2025-03-26)
      if (url.pathname === '/mcp') {
        const mcpServer = new SimpleMCPServer(env);
        return await mcpServer.handleRequest(request);
      }

      // Root endpoint with API info
      if (url.pathname === '/') {
        return new Response(JSON.stringify({
          name: 'directus-marketplace-search-mcp',
          version: '1.0.0',
          description: 'MCP server for Directus Marketplace search functionality',
          protocolVersion: '2024-11-05', // Default version
          supportedProtocolVersions: ['2024-11-05', '2025-06-18'],
          endpoints: {
            mcp: '/mcp',
            health: '/health',
            usage: '/usage',
            stats: '/admin/stats'
          },
          tools: [
            'search_extensions',
            'get_extension_details', 
            'get_extension_categories'
          ]
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};