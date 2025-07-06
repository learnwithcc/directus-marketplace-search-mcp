# Directus Marketplace Search MCP Server

A production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI assistants to search and discover Directus extensions. Deployed on Cloudflare Workers for global edge performance with intelligent protocol version negotiation.

## Features

- 🚀 **Edge Performance**: Deployed on Cloudflare Workers global network
- 🔍 **Comprehensive Search**: Search Directus extensions by name, description, keywords
- 📦 **Extension Categories**: Filter by interface, display, layout, panel, module, hook, endpoint, operation, theme
- ⚡ **Smart Caching**: Workers KV caching for sub-second response times
- 🛡️ **Security First**: Input validation, sanitization, and rate limiting
- 🌐 **Protocol Negotiation**: Supports both 2024-11-05 and 2025-06-18 MCP versions
- 💬 **Conversational Results**: AI-friendly responses for natural interactions
- 📊 **Real-time Data**: Direct integration with npm registry for up-to-date results
- 🖥️ **Universal Compatibility**: Works with Claude Desktop, web clients, and custom MCP implementations
- 🚦 **Smart Rate Limiting**: 100 requests/hour, 500 requests/day with upgrade messaging
- 📈 **Usage Monitoring**: Real-time analytics and cost estimation
- 📦 **NPX Package**: Easy installation with `npx directus-marketplace-mcp`
- 🔄 **One-Click Deploy**: Deploy your own unlimited instance in minutes

## Quick Start

### Option 1: NPX (Easiest)

```bash
npx directus-marketplace-mcp
```

### Option 2: Claude Desktop

Add this to your `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "directus-marketplace": {
      "command": "npx",
      "args": ["directus-marketplace-mcp"]
    }
  }
}
```

### Option 3: Direct Connection

**For Custom MCP Clients**:
- Server URL: `https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp`
- Protocol Versions: `2024-11-05`, `2025-06-18` (auto-negotiated)
- Rate Limits: 100 requests/hour, 500 requests/day

### Option 4: Deploy Your Own (Unlimited)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/learnwithcc/directus-marketplace-search-mcp)

```bash
git clone https://github.com/learnwithcc/directus-marketplace-search-mcp.git
cd directus-marketplace-search-mcp
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

## Rate Limits & Monitoring

Our public server includes intelligent rate limiting:

- **Hourly Limit**: 100 requests per IP address
- **Daily Limit**: 500 requests per IP address  
- **Headers**: Rate limit info included in all responses
- **Monitoring**: Real-time usage tracking and cost estimation

**Check your usage**: Visit `/usage` endpoint or `/admin/stats` for detailed analytics.

**Need more?** Deploy your own unlimited instance using the one-click deploy option above.

## MCP Tools

The server provides three AI-friendly tools that return conversational responses:

### 1. `search_extensions`
Search Directus marketplace extensions with intelligent filtering and popularity indicators.

**Parameters**:
- `query` (required): Search term for extension name, description, or keywords
- `category` (optional): Filter by extension type (`interfaces`, `displays`, `layouts`, `panels`, `modules`, `hooks`, `endpoints`, `operations`, `themes`)
- `limit` (optional): Number of results (1-50, default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort order (`relevance`, `downloads`, `updated`, `created`)

**Example Response**:
```
I found 3 Directus extensions for "AI"!

**@directus-labs/ai-writer-operation** (Very popular!)
Use OpenAI, Claude, Meta and Mistral Text Generation APIs to generate text.
[View on NPM](https://www.npmjs.com/package/@directus-labs/ai-writer-operation)

**directus-extension-ai-agent** (Moderately popular)
Transform your Directus CMS with intelligent automation and natural language processing.
[View on GitHub](https://github.com/cryptoraichu/directus-extension-ai-agent)
```

### 2. `get_extension_details`
Retrieve comprehensive information about a specific extension with installation guidance.

**Parameters**:
- `name` (required): Package name (e.g., `directus-extension-display-link`)

### 3. `get_extension_categories`
List all available extension categories with helpful descriptions and guidance.

**Returns**: Formatted guide to extension types with practical explanations.

## API Endpoints

When deployed, the server exposes these HTTP endpoints:

- **`/mcp`**: MCP protocol endpoint with automatic version negotiation
- **`/health`**: Health check endpoint  
- **`/usage`**: Personal usage statistics and rate limit info
- **`/admin/stats`**: Server-wide analytics and cost estimation
- **`/`**: Server information, supported protocol versions, and available tools

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
│   ├── index.ts              # Main worker entry point
│   ├── mcp-simple.ts         # MCP server with protocol negotiation
│   ├── services/
│   │   ├── directus.ts       # npm registry API integration
│   │   └── cache.ts          # Workers KV caching
│   ├── types/
│   │   ├── worker.ts         # Cloudflare Worker types
│   │   └── directus.ts       # Extension and search types
│   └── utils/
│       └── validation.ts     # Input validation and sanitization
├── demo/                     # Example implementations and tests
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
- **Protocol Negotiation**: Automatic version selection for optimal compatibility

## Security

- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Secure cross-origin resource sharing with intelligent origin handling
- **No Secrets in Code**: Environment-based configuration
- **Protocol Security**: Supports secure MCP transport with session management

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

🤖 *Powered by [Claude Code](https://claude.ai/code)*

## Live Server

🌐 **Public Instance**: `https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp`

Ready to use with Claude Desktop, MCP clients, and custom integrations!