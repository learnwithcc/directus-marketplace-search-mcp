# One-Click Deploy to Cloudflare Workers

🚫 **Deploy your own instance with ZERO rate limits** - unlimited requests for teams and heavy usage.

## Quick Deploy Options

### Option 1: Deploy Button (Recommended)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/learnwithcc/directus-marketplace-search-mcp)

### Option 2: Wrangler CLI

```bash
# Clone the repository
git clone https://github.com/learnwithcc/directus-marketplace-search-mcp.git
cd directus-marketplace-search-mcp

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npm run deploy
```

### Option 3: Fork and Deploy

1. **Fork** the [repository](https://github.com/learnwithcc/directus-marketplace-search-mcp)
2. **Connect** your fork to Cloudflare Workers
3. **Deploy** automatically via GitHub Actions

## What You Get

- 🚫 **ZERO RATE LIMITS** - Unlimited requests, no throttling whatsoever
- 🌍 **Global performance** - Deployed on 300+ edge locations worldwide  
- 🔧 **Zero maintenance** - Serverless auto-scaling, no servers to manage
- 💰 **Cost effective** - Likely free under Cloudflare's generous limits
- 🆕 **Latest features** - Easy updates from the main repository
- 🔒 **Your own data** - Complete control and privacy

## Cost Estimation

Based on our [cost analysis](/docs/cost-analysis.md), your instance will likely be **free** under Cloudflare Workers' generous limits:

- **Free Tier**: 10M requests/month + 30M CPU milliseconds/month
- **Paid Tier**: $5/month minimum (only if you exceed free tier)

**Most users will stay within the free tier** even with heavy usage.

## Setup Requirements

### Prerequisites

- [Cloudflare Account](https://cloudflare.com) (free)
- [GitHub Account](https://github.com) (for forking/cloning)
- [Node.js 20+](https://nodejs.org/) (for local development)

### Environment Variables

Optional configuration in your Cloudflare Workers dashboard:

```
ENVIRONMENT=production
DIRECTUS_API_TOKEN=your_token_here  # Optional: for private marketplace access
```

## After Deployment

### 1. Test Your Deployment

```bash
# Check health
curl https://your-worker-name.your-subdomain.workers.dev/health

# Test MCP endpoint  
curl -X POST https://your-worker-name.your-subdomain.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05"}}'
```

### 2. Configure Claude Desktop

Add to your `~/.claude/claude_desktop_config.json`:

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

### 3. Monitor Usage

Visit your deployment's admin dashboard:
```
https://your-worker-name.your-subdomain.workers.dev/admin/stats
```

## Customization Options

### Rate Limiting (Optional - Disabled by Default)

**Your deployed instance has NO rate limits by default.** The rate limiting code is included for flexibility, but you can:

**Option 1: Keep unlimited (recommended)**
- Do nothing - your instance has zero rate limits out of the box

**Option 2: Add optional rate limiting**
Edit `src/services/rate-limiter.ts` to enable limits:

```typescript
private static readonly REQUESTS_PER_HOUR = 1000;  // Set custom limits
private static readonly REQUESTS_PER_DAY = 10000;
```

**Option 3: Remove rate limiting entirely**
Comment out the rate limiting code in `src/mcp-simple.ts`:

```typescript
// Rate limiting (skip for non-functional requests)
// if (request.method !== 'OPTIONS') {
//   const clientIP = this.rateLimiter.getClientIP(request);
//   const rateLimitResult = await this.rateLimiter.checkRateLimit(clientIP);
//   // ... rate limiting logic
// }
```

**Note**: The public server uses rate limits to manage shared costs. Your private instance can have unlimited requests.

### Caching

Modify cache TTL in `src/services/directus.ts`:

```typescript
// Cache search results for 10 minutes instead of 5
await this.cacheService.set(cacheKey, filteredData, 600);
```

### Analytics

Add Cloudflare Analytics Engine for detailed tracking:

```toml
# In wrangler.toml
[[analytics_engine_datasets]]
binding = "ANALYTICS"
dataset = "your_dataset_name"
```

## Automatic Updates

### GitHub Actions (Recommended)

Set up automatic deployment on code changes:

1. **Fork** the repository
2. **Add secrets** to your fork:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
3. **Push changes** - automatic deployment via GitHub Actions

### Manual Updates

```bash
# Pull latest changes
git pull origin main

# Deploy updates
npm run deploy
```

## Troubleshooting

### Common Issues

**❌ Wrangler login fails**
```bash
# Clear existing auth and retry
npx wrangler logout
npx wrangler login
```

**❌ KV namespace creation fails**
```bash
# Create manually
npx wrangler kv:namespace create "CACHE" --preview false
# Update wrangler.toml with the returned ID
```

**❌ Build fails**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions)
- **Cloudflare Docs**: [Workers Documentation](https://developers.cloudflare.com/workers/)

## Security Considerations

- **Rate limiting** is enabled by default
- **CORS** is configured for security
- **Input validation** prevents injection attacks
- **No secrets** are stored in the codebase

### Production Hardening

For production use, consider:

1. **Authentication**: Add API key authentication
2. **Monitoring**: Set up alerting for unusual usage patterns  
3. **Backup**: Monitor your KV namespace usage
4. **Updates**: Subscribe to repository notifications for security updates

## Contributing

Found an issue or want to improve the deployment process?

1. **Fork** the repository
2. **Create** a feature branch
3. **Submit** a pull request

---

🚀 **Ready to deploy?** Choose your preferred method above and get your unlimited MCP server running in minutes!