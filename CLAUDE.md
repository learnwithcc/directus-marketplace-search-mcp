# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Directus Marketplace Search MCP Server** is a production-ready Model Context Protocol (MCP) server deployed on Cloudflare Workers. It enables AI assistants like Claude to search and discover Directus extensions through natural language queries.

### Key Features

- 🔍 **Smart Extension Search**: Search Directus marketplace by name, description, keywords, and categories
- ⚡ **Edge Performance**: Deployed on Cloudflare Workers global network (300+ locations)
- 🚦 **Rate Limiting**: Configurable IP-based rate limiting with usage monitoring
- 💾 **Intelligent Caching**: Workers KV caching for sub-second response times
- 🌐 **Protocol Negotiation**: Supports MCP versions 2024-11-05 and 2025-06-18
- 📊 **Usage Analytics**: Real-time monitoring and cost estimation

## Architecture

### Technology Stack

- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Language**: TypeScript (strict mode)
- **Protocol**: MCP (Model Context Protocol) over HTTP
- **Caching**: Cloudflare Workers KV
- **Validation**: Zod schemas
- **API Integration**: npm registry API

### Project Structure

```
src/
├── index.ts              # Main worker entry point and routing
├── mcp-simple.ts         # Custom MCP protocol implementation
├── services/
│   ├── directus.ts       # npm registry integration and search
│   ├── cache.ts          # Workers KV caching layer
│   ├── rate-limiter.ts   # IP-based rate limiting
│   └── monitoring.ts     # Usage analytics and monitoring
├── types/
│   ├── worker.ts         # Cloudflare Worker type definitions
│   └── directus.ts       # Extension and search type definitions
└── utils/
    └── validation.ts     # Input validation and sanitization

deploy/                   # One-click deployment resources
npm-package/             # NPX package for easy distribution
demo/                    # Demo and testing utilities
scripts/                 # Deployment and build scripts
```

## Development Workflow

### Prerequisites

- Node.js 20+
- npm or pnpm
- Cloudflare account (for deployment)
- Wrangler CLI (installed via npm)

### Local Development

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test

# Local development server
npm run dev
```

### Code Standards

- **TypeScript**: Strict mode enabled, all types must be explicit
- **ESLint**: Follow configured rules, run `npm run lint:fix` before committing
- **Naming**: Use descriptive names, follow TypeScript conventions
- **Comments**: Use JSDoc for public APIs, inline comments for complex logic
- **Error Handling**: Always handle errors explicitly, use proper JSON-RPC error codes

### Testing

- Unit tests with Vitest
- Integration tests for MCP protocol compliance
- Manual testing guide in `test-deployment.md`

### Deployment

```bash
# Full deployment with checks
npm run deploy

# Quick deployment (skip checks)
npm run deploy:quick

# View deployment logs
wrangler tail
```

## Key Design Decisions

### 1. Custom MCP Implementation

We use a simplified custom MCP implementation instead of `@modelcontextprotocol/sdk` because:
- SDK has CommonJS/ESM compatibility issues with Cloudflare Workers
- SDK is designed for stdio transport, not HTTP endpoints
- Custom implementation reduces bundle size from ~2MB to ~200KB
- Direct control over protocol for better debugging

See `CLOUDFLARE_WORKERS_MCP_COMPATIBILITY_REPORT.md` for detailed analysis.

### 2. Rate Limiting Strategy

- Implemented at the IP level using Workers KV
- Configurable limits (default: 100/hour, 500/day for public server)
- Can be disabled entirely for self-hosted instances
- Includes upgrade messaging for users who exceed limits

### 3. Caching Strategy

- Search results: 5-minute TTL (balance between freshness and performance)
- Extension details: 1-hour TTL (more stable data)
- Cache keys include all query parameters for accuracy

## Common Tasks

### Adding a New MCP Tool

1. Define the tool schema in `mcp-simple.ts` (tools array)
2. Implement the handler in the `handleToolCall` method
3. Add validation using Zod schemas
4. Update documentation in README.md
5. Add tests for the new tool

### Modifying Rate Limits

Edit `src/services/rate-limiter.ts`:

```typescript
private static readonly REQUESTS_PER_HOUR = 1000;  // Adjust as needed
private static readonly REQUESTS_PER_DAY = 10000;
```

### Updating Cache TTLs

Edit `src/services/directus.ts`:

```typescript
// Search results cache (in seconds)
await this.cacheService.set(cacheKey, filteredData, 300); // 5 minutes

// Extension details cache
await this.cacheService.set(detailsCacheKey, packageData, 3600); // 1 hour
```

### Adding New Endpoints

1. Add route handler in `src/index.ts`
2. Implement CORS headers if needed
3. Add to endpoint list in root response
4. Document in README.md
5. Add tests

## Environment Variables

Configure in Cloudflare Workers dashboard:

- `ENVIRONMENT`: Deployment environment (development/staging/production)
- `DIRECTUS_API_TOKEN`: (Optional) For private marketplace access

## Debugging

### Local Issues

```bash
# Check TypeScript compilation
npm run type-check

# View detailed logs
wrangler dev --local --log-level debug

# Test specific endpoints
curl -v http://localhost:8787/health
```

### Production Issues

```bash
# View live logs
wrangler tail

# Check deployment status
wrangler deployments list

# View KV namespace contents
wrangler kv:key list --binding=CACHE
```

## Security Considerations

- All user inputs validated and sanitized (Zod schemas)
- Rate limiting prevents abuse
- CORS configured with intelligent origin handling
- No secrets in code (environment variables only)
- Input size limits to prevent memory issues

## Performance Guidelines

- Keep bundle size minimal (currently ~200KB)
- Use caching aggressively (Workers KV is fast)
- Minimize external API calls
- Use concurrent requests where possible
- Monitor CPU time (Cloudflare billing metric)

## Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Directus Marketplace](https://directus.io/marketplace)
- [npm Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md)