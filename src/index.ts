/**
 * Directus Marketplace Search MCP Server
 * Deployed on Cloudflare Workers with HTTP transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import type { Env } from './types/worker.js';
import type { SearchParams, ExtensionCategory, SortOption } from './types/directus.js';
import { DirectusSearchService } from './services/directus.js';
import { CacheService } from './services/cache.js';
import { validateSearchParams } from './utils/validation.js';

export class DirectusMarketplaceMCPServer {
  private server: Server;
  private searchService: DirectusSearchService;
  private cacheService: CacheService;

  constructor(private env: Env) {
    this.server = new Server(
      {
        name: 'directus-marketplace-search',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.searchService = new DirectusSearchService(env);
    this.cacheService = new CacheService(env.CACHE);
    
    this.setupTools();
    this.setupErrorHandling();
  }

  private setupTools() {
    // Search Extensions Tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_extensions':
          return await this.handleSearchExtensions(args);
        case 'get_extension_details':
          return await this.handleGetExtensionDetails(args);
        case 'get_extension_categories':
          return await this.handleGetExtensionCategories();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // Register tool definitions
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'search_extensions',
            description: 'Search Directus marketplace extensions by query, category, and other filters',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for extension name, description, or keywords',
                  minLength: 1,
                  maxLength: 100
                },
                category: {
                  type: 'string',
                  enum: ['interfaces', 'displays', 'layouts', 'panels', 'modules', 'hooks', 'endpoints', 'operations', 'themes'],
                  description: 'Filter by extension category'
                },
                limit: {
                  type: 'number',
                  minimum: 1,
                  maximum: 50,
                  default: 10,
                  description: 'Maximum number of results to return'
                },
                offset: {
                  type: 'number',
                  minimum: 0,
                  default: 0,
                  description: 'Number of results to skip for pagination'
                },
                sort: {
                  type: 'string',
                  enum: ['relevance', 'downloads', 'updated', 'created'],
                  default: 'relevance',
                  description: 'Sort order for results'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'get_extension_details',
            description: 'Get detailed information about a specific Directus extension',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Extension package name (e.g., directus-extension-display-link)',
                  minLength: 1
                }
              },
              required: ['name']
            }
          },
          {
            name: 'get_extension_categories',
            description: 'Get list of available extension categories',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });
  }

  private async handleSearchExtensions(args: any) {
    try {
      const params = validateSearchParams(args);
      const results = await this.searchService.searchExtensions(params);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query: params.query,
              category: params.category,
              total: results.objects.length,
              results: results.objects.map(item => ({
                name: item.package.name,
                version: item.package.version,
                description: item.package.description,
                downloads: item.downloads,
                updated: item.updated,
                score: item.searchScore,
                author: item.package.publisher?.username,
                links: item.package.links
              }))
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Search extensions error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetExtensionDetails(args: any) {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100)
      });
      
      const { name } = schema.parse(args);
      const details = await this.searchService.getExtensionDetails(name);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(details, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Get extension details error:', error);
      throw new Error(`Failed to get extension details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetExtensionCategories() {
    try {
      const categories = [
        { name: 'interfaces', description: 'Custom field interfaces for data input' },
        { name: 'displays', description: 'Custom field displays for data presentation' },
        { name: 'layouts', description: 'Custom collection layout views' },
        { name: 'panels', description: 'Dashboard panels and widgets' },
        { name: 'modules', description: 'Full-page application modules' },
        { name: 'hooks', description: 'Server-side event hooks' },
        { name: 'endpoints', description: 'Custom API endpoints' },
        { name: 'operations', description: 'Flow operation nodes' },
        { name: 'themes', description: 'Custom themes and styling' }
      ];
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ categories }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Get categories error:', error);
      throw new Error(`Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('MCP Server error:', error);
    };
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Handle MCP endpoint
    if (url.pathname === '/mcp') {
      try {
        const transport = new SSEServerTransport(new WritableStream(), new ReadableStream());
        await this.server.connect(transport);
        return new Response('MCP server connected', { status: 200 });
      } catch (error) {
        console.error('MCP connection error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Root endpoint with API info
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        name: 'directus-marketplace-search-mcp',
        version: '1.0.0',
        description: 'MCP server for Directus Marketplace search functionality',
        endpoints: {
          mcp: '/mcp',
          health: '/health'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}

// Cloudflare Worker export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const server = new DirectusMarketplaceMCPServer(env);
      return await server.handleRequest(request);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};