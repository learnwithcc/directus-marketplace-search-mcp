# Directus Marketplace Search MCP Server

A high-performance [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for searching the Directus Marketplace, deployed on Cloudflare Workers for global edge performance.

[![Deploy to Cloudflare Workers](https://github.com/learnwithcc/directus-marketplace-search-mcp/actions/workflows/deploy.yml/badge.svg)](https://github.com/learnwithcc/directus-marketplace-search-mcp/actions/workflows/deploy.yml)

## Features

- 🚀 **Edge Performance**: Deployed on Cloudflare Workers global network
- 🔍 **Comprehensive Search**: Search Directus extensions by name, description, keywords
- 📦 **Extension Categories**: Filter by interface, display, layout, panel, module, hook, endpoint, operation, theme
- ⚡ **Smart Caching**: Workers KV caching for sub-second response times
- 🛡️ **Security First**: Input validation, sanitization, and rate limiting
- 🌐 **HTTP Transport**: Modern MCP implementation with SSE support
- 📊 **Real-time Data**: Direct integration with npm registry for up-to-date results

## Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Cloudflare Account](https://cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/learnwithcc/directus-marketplace-search-mcp.git
   cd directus-marketplace-search-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Cloudflare**:
   ```bash
   # Login to Cloudflare
   wrangler login
   
   # Verify your account
   wrangler whoami
   ```

4. **Deploy to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

## MCP Tools

The server provides three main MCP tools:

### 1. `search_extensions`
Search Directus marketplace extensions with flexible filtering.

**Parameters**:
- `query` (required): Search term for extension name, description, or keywords
- `category` (optional): Filter by extension type (`interfaces`, `displays`, `layouts`, `panels`, `modules`, `hooks`, `endpoints`, `operations`, `themes`)
- `limit` (optional): Number of results (1-50, default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort order (`relevance`, `downloads`, `updated`, `created`)

**Example**:
```json
{
  "name": "search_extensions",
  "arguments": {
    "query": "authentication",
    "category": "hooks",
    "limit": 5,
    "sort": "downloads"
  }
}
```

### 2. `get_extension_details`
Retrieve detailed information about a specific extension.

**Parameters**:
- `name` (required): Package name (e.g., `directus-extension-display-link`)

**Example**:
```json
{
  "name": "get_extension_details",
  "arguments": {
    "name": "directus-extension-display-link"
  }
}
```

### 3. `get_extension_categories`
List all available extension categories with descriptions.

**Example**:
```json
{
  "name": "get_extension_categories",
  "arguments": {}
}
```

## API Endpoints

When deployed, the server exposes these HTTP endpoints:

- **`/mcp`**: MCP protocol endpoint for tool interactions
- **`/health`**: Health check endpoint
- **`/`**: Server information and available endpoints

## Development

### Local Development

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Run type checking**:
   ```bash
   npm run type-check
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

### Testing

```bash
# Run tests
npm test

# Run tests in CI mode
npm run test:run
```

### Project Structure

```
directus-marketplace-search-mcp/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── services/
│   │   ├── directus.ts       # Directus API integration
│   │   └── cache.ts          # Workers KV caching
│   ├── types/
│   │   ├── worker.ts         # Cloudflare Worker types
│   │   └── directus.ts       # Directus API types
│   └── utils/
│       └── validation.ts     # Input validation
├── scripts/
│   └── deploy.sh            # Deployment script
├── .github/workflows/
│   └── deploy.yml           # CI/CD pipeline
└── wrangler.toml            # Cloudflare Workers config
```

## Deployment

### Automated Deployment (Recommended)

The repository includes GitHub Actions for automated deployment:

1. **Set up repository secrets**:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Push to main branch**: Deployment happens automatically

### Manual Deployment

```bash
# Full deployment with checks
npm run deploy

# Quick deployment (skip checks)
npm run deploy:quick
```

## Configuration

### Environment Variables

Configure these in your Cloudflare Workers dashboard or via Wrangler:

- `ENVIRONMENT`: Deployment environment (`development`, `staging`, `production`)
- `DIRECTUS_API_TOKEN`: (Optional) For private marketplace access

### KV Namespace

The deployment script automatically creates a KV namespace for caching. You can also create it manually:

```bash
wrangler kv:namespace create "CACHE"
```

## Performance

- **Global Edge**: Deployed on 300+ Cloudflare data centers worldwide
- **Sub-second Response**: Intelligent caching with Workers KV
- **Concurrent Requests**: Handles thousands of simultaneous requests
- **Zero Cold Starts**: Cloudflare Workers architecture

## Security

- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Secure cross-origin resource sharing
- **No Secrets in Code**: Environment-based configuration

## API Integration

The server integrates with the npm registry API to access Directus extensions:

- **Data Source**: `https://registry.npmjs.org/-/v1/search`
- **Filtering**: Automatic filtering for Directus-specific packages
- **Caching**: 5-minute cache for search results, 1-hour for package details
- **Rate Limiting**: Respectful API usage with built-in throttling

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions)
- **Documentation**: [Model Context Protocol](https://modelcontextprotocol.io/)

## Related Projects

- [Directus](https://directus.io/) - Open-source data platform
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol for AI-context integration
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless computing platform

---

Built with ❤️ for the Directus community

🤖 *Initial implementation generated with [Claude Code](https://claude.ai/code)*