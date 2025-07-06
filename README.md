# Directus Marketplace Search MCP Server

🔍 **Search and discover Directus extensions directly from your AI assistant**

An intelligent [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI assistants like Claude, Cursor, and others to search the Directus marketplace. Get conversational recommendations for Directus extensions with popularity indicators, descriptions, and direct links.

---

## 🚀 For Users: Get Started in 30 Seconds

### Claude Desktop (Recommended)

1. **Open your Claude Desktop configuration** at `~/.claude/claude_desktop_config.json`
2. **Add this configuration**:

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

3. **Restart Claude Desktop**
4. **Start asking**: "Find me a chart extension for Directus" or "What are the most popular Directus interfaces?"

### Cursor IDE

1. **Open Cursor settings**
2. **Navigate to MCP settings**
3. **Add server**: `npx directus-marketplace-mcp`
4. **Restart Cursor**

### Other AI Assistants

For AI assistants that support MCP:

**Simple setup:**
```bash
npx directus-marketplace-mcp
```

**Direct connection:**
- Server URL: `https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp`
- Protocol: MCP Streamable HTTP (2024-11-05, 2025-06-18)

---

## ✨ What You Can Ask

- "Find popular chart extensions for Directus"
- "What interfaces are available for file uploads?"
- "Show me the latest dashboard panels"
- "Find extensions for e-commerce workflows"
- "What's the most popular display extension?"

You'll get conversational responses with:
- 📊 **Popularity indicators** (downloads/month)
- 📝 **Clear descriptions** of what each extension does
- 🔗 **Direct links** to GitHub repos and NPM packages
- 🏷️ **Extension categories** and filtering

---

## 🆓 Free vs Unlimited

### Free Tier (Public Server)
- ✅ **100 requests per hour** per IP address
- ✅ **500 requests per day** per IP address
- ✅ **Perfect for evaluation** and light usage
- ✅ **No signup required**

*Great for trying out the service and occasional searches*

### Unlimited (Your Own Instance)
- ✅ **No rate limits** whatsoever
- ✅ **Deploy in under 5 minutes**
- ✅ **Likely free** under Cloudflare's generous limits
- ✅ **Global edge performance**

*Perfect for teams, heavy usage, or commercial projects*

---

## 🔄 Deploy Your Own (No Rate Limits)

**Want unlimited requests?** Deploy your own instance in minutes:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/learnwithcc/directus-marketplace-search-mcp)

### One-Click Deploy

```bash
git clone https://github.com/learnwithcc/directus-marketplace-search-mcp.git
cd directus-marketplace-search-mcp
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

The deploy script will:
1. ✅ Set up Cloudflare authentication
2. ✅ Create necessary cloud resources
3. ✅ Deploy your unlimited instance
4. ✅ Provide your custom server URL

### After Deployment

**Your instance will have:**
- 🚫 **Zero rate limits** - unlimited requests
- 🌍 **Global edge deployment** - sub-second responses worldwide
- 💰 **Likely free hosting** - Cloudflare's generous free tier covers most usage
- 🔒 **Your own data** - complete control and privacy

**Update your Claude Desktop config** with your new server:
```json
{
  "mcpServers": {
    "directus-marketplace": {
      "command": "npx",
      "args": [
        "mcp-remote", 
        "https://your-worker-name.your-subdomain.workers.dev/mcp"
      ]
    }
  }
}
```

### Cost Estimate for Self-Hosting

**Most users stay within Cloudflare's free tier:**
- 🆓 **Free**: Up to 10M requests/month + 30M CPU milliseconds/month
- 💵 **Paid**: $5/month minimum only if you exceed free limits

**Real usage examples:**
- Small team (10 users): **Free**
- Medium team (100 users): **Free** 
- Large team (1000+ users): ~$5-15/month

[See detailed cost analysis →](docs/cost-analysis.md)

---

## 🛠️ Available Tools & Features

The server provides three AI-friendly search tools:

### `search_extensions`
Find Directus extensions with intelligent filtering and popularity indicators.

**Example**: "Search for chart extensions"
```
I found 5 Directus extensions for "charts"!

**directus-extension-tradingview-panel**
A directus panel that show tradingview charts.
[View on GitHub](https://github.com/seymoe/directus-extension-tradingview-panel)

**directus-extension-display-link** (Very popular!)
Display URLs, phone numbers, and emails with a link button in Directus
[View on GitHub](https://github.com/jacoborus/directus-extension-display-link)
```

### `get_extension_details`
Get comprehensive information about a specific extension.

### `get_extension_categories`
Explore all available extension types with helpful descriptions.

**Extension Categories:**
- **Interfaces** - Custom field input components
- **Displays** - Custom field display components  
- **Layouts** - Collection view layouts
- **Panels** - Dashboard widgets
- **Modules** - Full-page application sections
- **Hooks** - Server-side event handlers
- **Endpoints** - Custom API routes
- **Operations** - Flow operation nodes
- **Themes** - Custom styling and themes

---

## 📊 Usage Monitoring

**Check your usage anytime:**
- Personal stats: `https://directus-marketplace-search-mcp.focuslab.workers.dev/usage`
- Server analytics: `https://directus-marketplace-search-mcp.focuslab.workers.dev/admin/stats`

**Rate limit headers** included in all responses:
- `X-RateLimit-Limit`: Your current limit
- `X-RateLimit-Remaining`: Requests remaining  
- `X-RateLimit-Reset`: When the limit resets

---

## 🆘 Support & Help

### Common Issues

**❓ "I don't see the tools in Claude Desktop"**
- Restart Claude Desktop after adding the configuration
- Check your `claude_desktop_config.json` syntax
- Try the NPX command directly: `npx directus-marketplace-mcp`

**❓ "Rate limit exceeded"**
- You've hit the 100/hour or 500/day limit on the public server
- Deploy your own unlimited instance (takes 5 minutes)
- Or wait for the rate limit to reset

**❓ "No results found"**
- Try broader search terms like "interface" or "display"
- Check extension categories with the categories tool
- Some extensions might not be tagged properly

### Get Help

- 🐛 **Issues**: [GitHub Issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions)
- 📚 **MCP Documentation**: [Model Context Protocol](https://modelcontextprotocol.io/)
- 🏥 **Server Health**: [Health Check](https://directus-marketplace-search-mcp.focuslab.workers.dev/health)

---

## 🔧 For Developers: Technical Documentation

### Features

- 🚀 **Edge Performance**: Deployed on Cloudflare Workers global network
- 🔍 **Comprehensive Search**: Search Directus extensions by name, description, keywords
- 📦 **Extension Categories**: Filter by interface, display, layout, panel, module, hook, endpoint, operation, theme
- ⚡ **Smart Caching**: Workers KV caching for sub-second response times
- 🛡️ **Security First**: Input validation, sanitization, and rate limiting
- 🌐 **Protocol Negotiation**: Supports both 2024-11-05 and 2025-06-18 MCP versions
- 💬 **Conversational Results**: AI-friendly responses for natural interactions
- 📊 **Real-time Data**: Direct integration with npm registry for up-to-date results
- 🖥️ **Universal Compatibility**: Works with Claude Desktop, web clients, and custom MCP implementations
- 🚦 **Smart Rate Limiting**: Configurable limits with upgrade messaging
- 📈 **Usage Monitoring**: Real-time analytics and cost estimation

### API Endpoints

When deployed, the server exposes these HTTP endpoints:

- **`/mcp`**: MCP protocol endpoint with automatic version negotiation
- **`/health`**: Health check endpoint  
- **`/usage`**: Personal usage statistics and rate limit info
- **`/admin/stats`**: Server-wide analytics and cost estimation
- **`/`**: Server information, supported protocol versions, and available tools

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/learnwithcc/directus-marketplace-search-mcp.git
   cd directus-marketplace-search-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Run type checking**:
   ```bash
   npm run type-check
   ```

5. **Run linting**:
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
│   │   ├── cache.ts          # Workers KV caching
│   │   ├── rate-limiter.ts   # IP-based rate limiting
│   │   └── monitoring.ts     # Usage analytics and monitoring
│   ├── types/
│   │   ├── worker.ts         # Cloudflare Worker types
│   │   └── directus.ts       # Extension and search types
│   └── utils/
│       └── validation.ts     # Input validation and sanitization
├── deploy/                   # One-click deployment resources
├── npm-package/             # NPX package for easy distribution
├── .github/workflows/
│   └── deploy.yml           # CI/CD pipeline
└── wrangler.toml            # Cloudflare Workers config
```

### Rate Limiting Configuration

**For your own deployment**, rate limiting is completely configurable or can be disabled entirely.

**To remove rate limits** in your deployment:

1. **Comment out rate limiting** in `src/mcp-simple.ts`:
```typescript
// Rate limiting (skip for non-functional requests)
// if (request.method !== 'OPTIONS') {
//   const clientIP = this.rateLimiter.getClientIP(request);
//   const rateLimitResult = await this.rateLimiter.checkRateLimit(clientIP);
//   // ... rate limiting logic
// }
```

2. **Or adjust limits** in `src/services/rate-limiter.ts`:
```typescript
private static readonly REQUESTS_PER_HOUR = 10000;  // Increase limits
private static readonly REQUESTS_PER_DAY = 100000;   // Or set very high
```

3. **Or disable entirely** by setting limits to `Infinity`:
```typescript
private static readonly REQUESTS_PER_HOUR = Infinity;
private static readonly REQUESTS_PER_DAY = Infinity;
```

**The public server has rate limits to prevent abuse and manage costs. Your own deployment can have whatever limits you choose, including none at all.**

### Deployment

#### Automated Deployment (Recommended)

The repository includes GitHub Actions for automated deployment:

1. **Set up repository secrets**:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Push to main branch**: Deployment happens automatically

#### Manual Deployment

```bash
# Full deployment with checks
npm run deploy

# Quick deployment (skip checks)
npm run deploy:quick
```

### Configuration

#### Environment Variables

Configure these in your Cloudflare Workers dashboard or via Wrangler:

- `ENVIRONMENT`: Deployment environment (`development`, `staging`, `production`)
- `DIRECTUS_API_TOKEN`: (Optional) For private marketplace access

#### KV Namespace

The deployment script automatically creates a KV namespace for caching. You can also create it manually:

```bash
wrangler kv:namespace create "CACHE"
```

### Performance

- **Global Edge**: Deployed on 300+ Cloudflare data centers worldwide
- **Sub-second Response**: Intelligent caching with Workers KV
- **Concurrent Requests**: Handles thousands of simultaneous requests
- **Zero Cold Starts**: Cloudflare Workers architecture
- **Protocol Negotiation**: Automatic version selection for optimal compatibility

### Security

- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: Configurable protection against abuse
- **CORS Support**: Secure cross-origin resource sharing with intelligent origin handling
- **No Secrets in Code**: Environment-based configuration
- **Protocol Security**: Supports secure MCP transport with session management

### API Integration

The server integrates with the npm registry API to access Directus extensions:

- **Data Source**: `https://registry.npmjs.org/-/v1/search`
- **Filtering**: Automatic filtering for Directus-specific packages
- **Caching**: 5-minute cache for search results, 1-hour for package details
- **Rate Limiting**: Respectful API usage with built-in throttling

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Related Projects

- [Directus](https://directus.io/) - Open-source data platform
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol for AI-context integration
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless computing platform

---

Built with ❤️ for the Directus community

🤖 *Powered by [Claude Code](https://claude.ai/code)*

## Live Server

🌐 **Public Instance**: `https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp`

Ready to use with Claude Desktop, MCP clients, and custom integrations!