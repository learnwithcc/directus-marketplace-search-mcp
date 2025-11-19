# Architecture Documentation

This document provides a detailed overview of the Directus Marketplace Search MCP Server architecture.

## System Overview

The MCP server is a serverless application deployed on Cloudflare Workers that provides AI assistants with the ability to search and discover Directus extensions through the Model Context Protocol (MCP).

```
┌─────────────────┐
│  AI Assistant   │
│ (Claude, etc.)  │
└────────┬────────┘
         │ MCP Protocol (JSON-RPC 2.0)
         │ HTTP POST /mcp
         ▼
┌─────────────────────────────────────┐
│     Cloudflare Workers Runtime      │
│  ┌───────────────────────────────┐  │
│  │      MCP Server Handler       │  │
│  │   (SimpleMCPServer class)     │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│      ┌───────┴────────┐             │
│      ▼                ▼              │
│  ┌────────┐    ┌──────────┐         │
│  │ Rate   │    │ Request  │         │
│  │ Limiter│    │ Validator│         │
│  └────┬───┘    └─────┬────┘         │
│       │              │               │
│       ▼              ▼               │
│  ┌─────────────────────┐            │
│  │  Directus Service   │            │
│  │  (Search Logic)     │            │
│  └──────────┬──────────┘            │
│             │                        │
│     ┌───────┴────────┐              │
│     ▼                ▼               │
│ ┌────────┐     ┌──────────┐         │
│ │ Cache  │     │   npm    │         │
│ │ Service│     │ Registry │         │
│ │  (KV)  │     │   API    │         │
│ └────────┘     └──────────┘         │
└─────────────────────────────────────┘
```

## Core Components

### 1. Entry Point (`src/index.ts`)

**Responsibilities:**
- HTTP request routing
- CORS handling
- Health check endpoints
- Usage statistics endpoints
- Admin monitoring endpoints

**Key Routes:**
- `GET /health` - Health check endpoint
- `GET /usage` - Personal usage statistics
- `GET /admin/stats` - Server-wide analytics
- `POST /mcp` - MCP protocol endpoint
- `GET /` - Server information

**Code Flow:**
```typescript
Request → CORS Handler → Route Matcher → Handler → Response
```

### 2. MCP Server (`src/mcp-simple.ts`)

**Responsibilities:**
- MCP protocol implementation
- JSON-RPC 2.0 request/response handling
- Protocol version negotiation (2024-11-05, 2025-06-18)
- Tool registration and execution
- Session management

**Supported Methods:**
- `initialize` - Protocol handshake
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `ping` - Connection health check

**Protocol Negotiation:**
```typescript
Client sends: protocolVersion: "2024-11-05" or "2025-06-18"
Server responds: Matching protocol version + capabilities
```

### 3. Directus Service (`src/services/directus.ts`)

**Responsibilities:**
- npm registry API integration
- Extension search and filtering
- Data transformation and formatting
- Popularity calculation
- Response formatting for AI assistants

**Search Flow:**
```
Query → Validation → Cache Check → npm API → Filter → Sort → Format → Response
                         ↓                                            ↑
                    Cache Hit? ──────────────────────────────────────┘
```

**npm Registry Integration:**
- Endpoint: `https://registry.npmjs.org/-/v1/search`
- Search scope: Packages with "directus-extension" prefix
- Fields retrieved: name, description, version, downloads, etc.

### 4. Cache Service (`src/services/cache.ts`)

**Responsibilities:**
- Workers KV integration
- TTL-based caching
- Cache key generation
- Cache invalidation

**Cache Strategy:**
```
Search Results:
  Key: search:{query}:{category}:{limit}:{sort}
  TTL: 300 seconds (5 minutes)

Extension Details:
  Key: extension:{packageName}
  TTL: 3600 seconds (1 hour)

Rate Limit Data:
  Key: ratelimit:{ip}:{window}
  TTL: Dynamic (1 hour or 24 hours)
```

### 5. Rate Limiter (`src/services/rate-limiter.ts`)

**Responsibilities:**
- IP-based rate limiting
- Request counting and tracking
- Usage statistics
- Upgrade messaging

**Algorithm:**
```
Request → Get IP → Check Hourly Limit → Check Daily Limit → Allow/Deny
                        ↓                        ↓
                   Update Counter         Update Counter
```

**Limits (Configurable):**
- Default: 100 requests/hour per IP
- Default: 500 requests/day per IP
- Can be disabled for self-hosted instances

### 6. Monitoring Service (`src/services/monitoring.ts`)

**Responsibilities:**
- Server-wide analytics
- Usage aggregation
- Cost estimation
- Performance metrics

**Metrics Collected:**
- Total requests
- Unique IP addresses
- Request distribution by endpoint
- Cache hit rates
- Error rates

## Data Flow

### Search Request Flow

```
1. User asks Claude: "Find chart extensions for Directus"

2. Claude sends MCP request:
   POST /mcp
   {
     "method": "tools/call",
     "params": {
       "name": "search_extensions",
       "arguments": { "query": "chart" }
     }
   }

3. MCP Server processes:
   - Validates request (Zod schema)
   - Checks rate limit (KV lookup)
   - Checks cache (KV lookup)
   - If cache miss: Query npm registry
   - Filter results (Directus extensions only)
   - Calculate popularity
   - Format for AI (conversational)
   - Update cache

4. Response sent to Claude:
   {
     "result": {
       "content": [
         {
           "type": "text",
           "text": "I found 5 Directus extensions for 'charts'!..."
         }
       ]
     }
   }

5. Claude presents results to user in natural language
```

### Caching Flow

```
Request → Generate Cache Key → KV Lookup
                                   ↓
                            ┌──────┴──────┐
                            ▼             ▼
                        Cache Hit     Cache Miss
                            │             │
                            │             ▼
                            │      Fetch from npm
                            │             │
                            │             ▼
                            │      Store in KV
                            │             │
                            └──────┬──────┘
                                   ▼
                            Return Response
```

## Security Architecture

### Input Validation

**Layers:**
1. **Type Validation** - Zod schemas for all inputs
2. **Size Limits** - Max query length, result limits
3. **Sanitization** - Remove/escape dangerous characters
4. **Format Validation** - JSON-RPC 2.0 compliance

**Example:**
```typescript
const searchSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10),
  sort: z.enum(['relevance', 'downloads', 'updated', 'created']).default('relevance')
});
```

### Rate Limiting

**Multi-Layer Protection:**
1. **IP-based limits** - Prevent individual abuse
2. **Time windows** - Hourly and daily limits
3. **Graceful degradation** - Informative error messages
4. **Upgrade path** - Self-hosting instructions

### CORS Security

**Intelligent Origin Handling:**
```typescript
// Development: Allow localhost
// Production: Mirror request origin
// Fallback: Allow all (for public API)

const origin = request.headers.get('Origin');
headers['Access-Control-Allow-Origin'] = origin || '*';
```

## Performance Architecture

### Edge Computing

**Global Distribution:**
- Deployed on 300+ Cloudflare data centers
- Automatic routing to nearest edge location
- Sub-50ms latency for most users worldwide

### Caching Strategy

**Multi-Level Caching:**
1. **Workers KV** - Edge-cached key-value store (60s-3600s TTL)
2. **npm Registry** - Upstream CDN caching
3. **Browser Cache** - HTTP cache headers for static content

### Bundle Optimization

**Size Reduction:**
- Original (with SDK): ~2MB
- Optimized (custom): ~200KB
- Techniques: Tree shaking, no SDK dependencies, minimal deps

## Scalability

### Horizontal Scaling

**Automatic:**
- Cloudflare Workers auto-scale to millions of requests
- No manual configuration required
- Pay-per-use pricing model

### Resource Limits

**Per Request:**
- CPU Time: 10ms (free tier), 50ms (paid tier)
- Memory: 128MB
- Execution Time: 30 seconds (HTTP), 15 minutes (cron)

**Per Worker:**
- Request Rate: Unlimited*
- Concurrent Requests: Unlimited*
- Storage: 1GB (KV, free tier)

*Within Cloudflare Terms of Service

## Monitoring & Observability

### Built-in Endpoints

```
GET /health
  → Service health status

GET /usage
  → Personal usage statistics and rate limit info

GET /admin/stats
  → Server-wide analytics and metrics
```

### Cloudflare Analytics

**Available Metrics:**
- Request volume
- Error rates
- Response times
- Geographic distribution
- Cache hit rates

### Logging

**Structured Logging:**
```typescript
console.log('[Search]', { query, results: count, cached: fromCache });
console.error('[Error]', { method, error: error.message, stack });
```

**Access via Wrangler:**
```bash
wrangler tail
wrangler tail --format json
```

## Error Handling

### JSON-RPC Error Codes

```typescript
-32700: Parse error (invalid JSON)
-32600: Invalid request (malformed JSON-RPC)
-32601: Method not found
-32602: Invalid parameters
-32603: Internal error
-32000: Rate limit exceeded
```

### Error Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid parameters",
    "data": {
      "validation": ["query must be between 1 and 100 characters"]
    }
  }
}
```

## Deployment Architecture

### CI/CD Pipeline

```
Git Push → GitHub Actions → Build → Test → Deploy → Health Check
                              ↓       ↓       ↓
                          Type Check  Lint  Wrangler
```

### Environment Management

**Environments:**
- `development` - Local wrangler dev
- `staging` - Preview deployments (PR builds)
- `production` - Main branch deployments

**Configuration:**
- `wrangler.toml` - Worker configuration
- GitHub Secrets - API tokens and credentials
- Environment Variables - Runtime configuration

## Technology Decisions

### Why Cloudflare Workers?

✅ **Global Edge Network** - 300+ locations
✅ **Zero Cold Starts** - Instant response
✅ **Generous Free Tier** - 10M requests/month
✅ **Built-in KV Store** - Fast edge caching
✅ **Simple Deployment** - Single command
✅ **Automatic Scaling** - Handle any load

### Why Custom MCP Implementation?

✅ **Cloudflare Compatibility** - No ESM/CommonJS issues
✅ **Smaller Bundle** - 200KB vs 2MB
✅ **HTTP-Native** - Built for Workers environment
✅ **Better Control** - Direct protocol implementation
✅ **Easier Debugging** - No SDK abstraction

### Why Workers KV for Caching?

✅ **Edge-Cached** - Low latency worldwide
✅ **Simple API** - Easy to use
✅ **Generous Limits** - 100K reads/day free
✅ **Automatic Replication** - Global distribution
✅ **TTL Support** - Automatic expiration

## Future Architecture Considerations

### Potential Enhancements

1. **Analytics Engine Integration**
   - Detailed query analytics
   - User behavior tracking
   - Performance metrics

2. **Durable Objects**
   - Real-time collaboration features
   - Stateful connections
   - WebSocket support

3. **R2 Storage**
   - Large dataset caching
   - Historical data storage
   - Backup and archival

4. **Queue Integration**
   - Async processing
   - Batch operations
   - Background tasks

### Scalability Roadmap

**Current: 1-10M requests/month**
- Single Worker deployment
- Workers KV caching
- Rate limiting

**Future: 10-100M requests/month**
- Multiple Workers (regions)
- Analytics Engine
- Advanced monitoring

**Future: 100M+ requests/month**
- Durable Objects for state
- R2 for large datasets
- Queue-based processing

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Workers KV Docs](https://developers.cloudflare.com/kv/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [npm Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md)

---

**Last Updated:** 2024-12-15
