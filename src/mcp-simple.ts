/**
 * Streamable HTTP MCP Server Implementation for Cloudflare Workers
 * Implements MCP Streamable HTTP transport (2025-03-26 specification)
 */

import type { Env } from './types/worker.js';
import { DirectusSearchService } from './services/directus.js';
import { RateLimiterService } from './services/rate-limiter.js';
import { MonitoringService } from './services/monitoring.js';
import { validateSearchParams } from './utils/validation.js';
import { z } from 'zod';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface McpServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  supportedProtocolVersions?: string[];
  capabilities: {
    tools?: {
      listChanged?: boolean;
    };
    resources?: {
      subscribe?: boolean;
      listChanged?: boolean;
    };
    prompts?: {
      listChanged?: boolean;
    };
    logging?: {};
  };
}

export class SimpleMCPServer {
  private searchService: DirectusSearchService;
  private rateLimiter: RateLimiterService;
  private monitoring: MonitoringService;
  private serverInfo: McpServerInfo;
  private sessions: Map<string, { created: number }> = new Map();

  constructor(private env: Env) {
    this.searchService = new DirectusSearchService(env);
    this.rateLimiter = new RateLimiterService(env);
    this.monitoring = new MonitoringService(env);
    this.serverInfo = {
      name: 'directus-marketplace-search',
      version: '1.0.0',
      protocolVersion: '2024-11-05', // Default, but negotiated during initialize
      supportedProtocolVersions: ['2024-11-05', '2025-06-18'],
      capabilities: {
        tools: {
          listChanged: true
        }
      }
    };
  }

  async handleRequest(request: Request): Promise<Response> {
    const startTime = Date.now();
    
    // Get origin for proper CORS handling
    const origin = request.headers.get('Origin');
    const userAgent = request.headers.get('User-Agent');
    const referer = request.headers.get('Referer');
    console.log('Request origin:', origin);
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    console.log('User-Agent:', userAgent);
    console.log('Referer:', referer);
    
    // More permissive CORS for development
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*', 
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    // Rate limiting (skip for non-functional requests)
    if (request.method !== 'OPTIONS') {
      const clientIP = this.rateLimiter.getClientIP(request);
      const rateLimitResult = await this.rateLimiter.checkRateLimit(clientIP);
      
      if (!rateLimitResult.allowed) {
        const resetTime = new Date(rateLimitResult.resetTime).toISOString();
        const errorMessage = rateLimitResult.reason === 'hourly_limit_exceeded' 
          ? `Rate limit exceeded. You can make ${rateLimitResult.limit} requests per hour. Try again after ${resetTime}.`
          : `Daily rate limit exceeded. You can make ${rateLimitResult.limit} requests per day. Try again after ${resetTime}.`;
        
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: errorMessage,
          resetTime: resetTime,
          limit: rateLimitResult.limit,
          upgradeMessage: 'For unlimited access, deploy your own instance using our one-click template at https://github.com/learnwithcc/directus-marketplace-search-mcp'
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            ...corsHeaders
          }
        });
      }
      
      // Add rate limit headers to successful responses
      (corsHeaders as any)['X-RateLimit-Limit'] = rateLimitResult.limit.toString();
      (corsHeaders as any)['X-RateLimit-Remaining'] = rateLimitResult.remaining.toString();
      (corsHeaders as any)['X-RateLimit-Reset'] = rateLimitResult.resetTime.toString();
    }

    // Handle different HTTP methods
    let response: Response;
    let toolName: string | undefined;
    
    try {
      switch (request.method) {
        case 'GET':
          response = await this.handleGetRequest(request, corsHeaders);
          break;
        case 'POST':
          response = await this.handlePostRequest(request, corsHeaders);
          // Try to extract tool name from successful POST responses
          if (response.status === 200) {
            toolName = await this.extractToolNameFromRequest(request);
          }
          break;
        case 'DELETE':
          response = await this.handleDeleteRequest(request, corsHeaders);
          break;
        default:
          response = new Response('Method not allowed', { 
            status: 405,
            headers: corsHeaders 
          });
      }
    } catch (error) {
      console.error('Request handling error:', error);
      response = new Response('Internal Server Error', {
        status: 500,
        headers: corsHeaders
      });
    }
    
    // Track the request
    const responseTime = Date.now() - startTime;
    const success = response.status < 400;
    const errorCode = success ? undefined : response.status;
    
    this.monitoring.trackRequest(request, success, responseTime, errorCode, toolName);
    
    return response;
  }

  private async handleGetRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    const accept = request.headers.get('Accept');
    
    // Check if this is an SSE request
    if (accept && accept.includes('text/event-stream')) {
      return await this.handleSSERequest(request, corsHeaders);
    }
    
    return new Response('Bad Request - Expected SSE', {
      status: 400,
      headers: corsHeaders
    });
  }

  private async handlePostRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      // Log all headers for debugging
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('POST request headers:', headers);
      
      // Check if request has a body
      const contentLength = request.headers.get('content-length');
      const hasBody = contentLength && parseInt(contentLength) > 0;
      console.log('Request has body:', hasBody, 'Content-Length:', contentLength);
      
      let jsonRpcRequest: JsonRpcRequest;
      try {
        if (!hasBody) {
          throw new Error('Request body is empty');
        }
        
        const text = await request.text();
        console.log('Raw request body:', text);
        
        if (!text.trim()) {
          throw new Error('Request body is empty or whitespace only');
        }
        
        jsonRpcRequest = JSON.parse(text);
        console.log('Received JSON-RPC request:', jsonRpcRequest);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw {
          code: -32700,
          message: 'Parse error',
          data: parseError instanceof Error ? parseError.message : 'Invalid JSON'
        };
      }
      
      // Handle notifications (no response needed)
      if (jsonRpcRequest.id === undefined || jsonRpcRequest.id === null) {
        console.log('Handling notification request:', jsonRpcRequest.method);
        try {
          await this.handleNotification(jsonRpcRequest);
          console.log('Notification handled successfully');
          return new Response(null, {
            status: 204,
            headers: corsHeaders
          });
        } catch (notificationError) {
          console.error('Notification handling error:', notificationError);
          // For notifications, we still return 204 even if there's an error
          return new Response(null, {
            status: 204,
            headers: corsHeaders
          });
        }
      }
      
      const response = await this.handleJsonRpcRequest(jsonRpcRequest, request);
      
      // Check if this was an initialize request and set session header
      const responseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...corsHeaders
      };
      
      if (jsonRpcRequest.method === 'initialize' && (request as any)._sessionId) {
        responseHeaders['Mcp-Session-Id'] = (request as any)._sessionId;
        console.log('Setting session header:', (request as any)._sessionId);
      }
      
      const responseBody = JSON.stringify(response);
      console.log('Sending response:', responseBody);
      console.log('Response headers:', responseHeaders);
      
      return new Response(responseBody, {
        headers: responseHeaders
      });
    } catch (error: any) {
      console.error('MCP request error:', error);
      const errorResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: 0,
        error: {
          code: error.code || -32603,
          message: error.message || 'Internal error',
          data: error.data || (error instanceof Error ? error.message : 'Unknown error')
        }
      };
      
      return new Response(JSON.stringify(errorResponse), {
        status: 200, // JSON-RPC errors should return 200 with error in body
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }

  private async handleDeleteRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    const sessionId = request.headers.get('Mcp-Session-Id');
    
    if (sessionId && this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      console.log(`Session ${sessionId} terminated`);
    }
    
    return new Response('', {
      status: 204,
      headers: corsHeaders
    });
  }

  private async handleSSERequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    // For now, return a basic SSE response
    // In a full implementation, this would establish an SSE stream
    return new Response('event: connected\ndata: {"connected": true}\n\n', {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders
      }
    });
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  private async extractToolNameFromRequest(request: Request): Promise<string | undefined> {
    try {
      // Clone the request to read the body without consuming it
      const cloned = request.clone();
      const text = await cloned.text();
      
      if (!text.trim()) {
        return undefined;
      }
      
      const jsonRpcRequest = JSON.parse(text);
      
      if (jsonRpcRequest.method === 'tools/call' && jsonRpcRequest.params?.name) {
        return jsonRpcRequest.params.name;
      }
    } catch (error) {
      // Ignore errors, just return undefined
    }
    
    return undefined;
  }

  private async handleJsonRpcRequest(jsonRpcRequest: JsonRpcRequest, httpRequest: Request): Promise<JsonRpcResponse> {
    try {
      let result: any;

      switch (jsonRpcRequest.method) {
        case 'initialize':
          result = await this.handleInitialize(jsonRpcRequest.params, httpRequest);
          break;
        case 'tools/list':
          result = await this.handleToolsList();
          break;
        case 'tools/call':
          result = await this.handleToolCall(jsonRpcRequest.params);
          break;
        default:
          throw {
            code: -32601,
            message: `Method not found: ${jsonRpcRequest.method}`
          };
      }

      return {
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        result
      };
    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: error.code || -32603,
          message: error.message || 'Internal error',
          data: error.data
        }
      };
    }
  }

  private async handleNotification(request: JsonRpcRequest): Promise<void> {
    // Handle MCP notifications (like initialized)
    console.log('Handling notification:', request.method, request);
    switch (request.method) {
      case 'initialized':
        // Client has finished initialization
        console.log('Client initialized successfully');
        break;
      case 'notifications/cancelled':
        // Handle cancellation
        console.log('Request cancelled');
        break;
      case 'notifications/progress':
        // Handle progress updates
        console.log('Progress notification');
        break;
      default:
        console.log('Unknown notification method:', request.method);
    }
  }

  private async handleInitialize(params: any, httpRequest: Request): Promise<any> {
    // Generate session ID for this connection
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, { created: Date.now() });
    
    console.log(`New session created: ${sessionId}`);
    console.log('Client requested protocol version:', params?.protocolVersion);
    
    // Set session ID in response headers for the calling method to use
    (httpRequest as any)._sessionId = sessionId;
    
    // Support both protocol versions
    const clientProtocolVersion = params?.protocolVersion;
    const supportedVersions = ['2024-11-05', '2025-06-18'];
    
    let negotiatedVersion = '2024-11-05'; // Default to older version for compatibility
    if (supportedVersions.includes(clientProtocolVersion)) {
      negotiatedVersion = clientProtocolVersion;
    }
    
    console.log(`Negotiated protocol version: ${negotiatedVersion}`);
    
    return {
      protocolVersion: negotiatedVersion,
      capabilities: this.serverInfo.capabilities,
      serverInfo: {
        ...this.serverInfo,
        protocolVersion: negotiatedVersion
      }
    };
  }

  private async handleToolsList(): Promise<{ tools: any[] }> {
    return {
      tools: [
        {
          name: 'search_extensions',
          description: 'Search Directus marketplace extensions by query, category, and other filters. Returns a simple list with extension names, descriptions, popularity indicators, and GitHub/NPM links.',
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
          description: 'Get detailed information about a specific Directus extension including name, version, description, author, and links to GitHub/NPM.',
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
          description: 'Get a simple list of all available Directus extension categories with brief descriptions.',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    };
  }

  private async handleToolCall(params: any): Promise<{ content: any[] }> {
    const { name, arguments: args } = params;

    switch (name) {
      case 'search_extensions':
        return await this.handleSearchExtensions(args);
      case 'get_extension_details':
        return await this.handleGetExtensionDetails(args);
      case 'get_extension_categories':
        return await this.handleGetExtensionCategories();
      default:
        throw {
          code: -32601,
          message: `Unknown tool: ${name}`
        };
    }
  }

  private async handleSearchExtensions(args: any): Promise<{ content: any[] }> {
    try {
      const params = validateSearchParams(args);
      const results = await this.searchService.searchExtensions(params);
      
      if (results.objects.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No Directus extensions found for "${params.query}"${params.category ? ` in category "${params.category}"` : ''}.`
            }
          ]
        };
      }

      // Simple conversational format
      let response = `I found ${results.objects.length} Directus extensions for "${params.query}"${params.category ? ` in the ${params.category} category` : ''}!\n\n`;
      
      results.objects.forEach((item, index) => {
        const pkg = item.package;
        const downloads = item.downloads;
        const monthlyDownloads = typeof downloads === 'number' ? downloads : downloads.monthly;
        
        // Determine popularity
        let popularity = '';
        if (monthlyDownloads > 1000) {
          popularity = ' (Very popular!)';
        } else if (monthlyDownloads > 500) {
          popularity = ' (Popular)';
        } else if (monthlyDownloads > 100) {
          popularity = ' (Moderately popular)';
        }
        
        // Simple format: Name, Description, Popularity, Link
        response += `**${pkg.name}**${popularity}\n`;
        response += `${pkg.description}\n`;
        
        // Add the most relevant link (prefer GitHub over npm)
        if (pkg.links?.repository) {
          const repoUrl = pkg.links.repository.replace('git+', '').replace('.git', '');
          response += `[View on GitHub](${repoUrl})\n\n`;
        } else if (pkg.links?.npm) {
          response += `[View on NPM](${pkg.links.npm})\n\n`;
        } else {
          response += `\n`;
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: response.trim()
          }
        ]
      };
    } catch (error) {
      throw {
        code: -32603,
        message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleGetExtensionDetails(args: any): Promise<{ content: any[] }> {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100)
      });
      
      const { name } = schema.parse(args);
      const details = await this.searchService.getExtensionDetails(name);
      
      if (!details) {
        return {
          content: [
            {
              type: 'text',
              text: `Extension "${name}" not found in the Directus marketplace.`
            }
          ]
        };
      }

      // Simple extension details format
      let response = `**${details.name}** (v${details.version})\n\n`;
      
      if (details.description) {
        response += `${details.description}\n\n`;
      }
      
      if (details.publisher?.username) {
        response += `By: ${details.publisher.username}\n`;
      }
      
      if (details.date) {
        response += `Updated: ${new Date(details.date).toLocaleDateString()}\n`;
      }
      
      response += `\n`;
      
      // Links section
      if (details.links?.repository) {
        const repoUrl = details.links.repository.replace('git+', '').replace('.git', '');
        response += `[View on GitHub](${repoUrl})\n`;
      }
      if (details.links?.npm) {
        response += `[View on NPM](${details.links.npm})\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: response
          }
        ]
      };
    } catch (error) {
      throw {
        code: -32603,
        message: `Failed to get extension details: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleGetExtensionCategories(): Promise<{ content: any[] }> {
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
      
      // Simple categories format
      let response = "Here are the types of Directus extensions you can search for:\n\n";
      
      categories.forEach((category) => {
        response += `**${category.name}** - ${category.description}\n`;
      });
      
      response += `\nJust tell me what kind of functionality you're looking for and I'll search for extensions!`;
      
      return {
        content: [
          {
            type: 'text',
            text: response
          }
        ]
      };
    } catch (error) {
      throw {
        code: -32603,
        message: `Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}