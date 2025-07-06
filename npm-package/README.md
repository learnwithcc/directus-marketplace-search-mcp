# Directus Marketplace Search MCP

🚀 **Easy access to the Directus Marketplace Search MCP server**

This NPX package provides instant access to search and discover Directus extensions through the Model Context Protocol (MCP). Perfect for AI assistants, chatbots, and development workflows.

## Quick Start

```bash
npx directus-marketplace-mcp
```

## Features

- 🔍 **Search Extensions**: Find Directus extensions by name, description, or keywords
- 📦 **Extension Details**: Get comprehensive information about specific extensions  
- 🏷️ **Categories**: Explore extensions by type (interfaces, displays, layouts, etc.)
- ⚡ **Fast**: Powered by Cloudflare Workers global edge network
- 💬 **AI-Friendly**: Returns conversational responses perfect for AI assistants

## Available Tools

### `search_extensions`
Search the Directus marketplace for extensions with intelligent filtering.

**Parameters:**
- `query` (required): Search term
- `category` (optional): Filter by extension type
- `limit` (optional): Number of results (1-50, default: 10)
- `sort` (optional): Sort by relevance, downloads, updated, or created

### `get_extension_details` 
Get detailed information about a specific extension.

**Parameters:**
- `name` (required): Package name (e.g., `directus-extension-display-link`)

### `get_extension_categories`
List all available extension categories with descriptions.

## Usage with Claude Desktop

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

## Usage with Custom MCP Clients

Connect directly to our hosted server:

- **Server URL**: `https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp`
- **Protocol**: Streamable HTTP (supports 2024-11-05 and 2025-06-18)
- **Authentication**: None required

## Rate Limits

Our public server has generous rate limits:
- **100 requests per hour** per IP address
- **500 requests per day** per IP address

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Your current limit
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: When the limit resets

## Deploy Your Own

For unlimited access, deploy your own instance:

1. **One-click deploy** (coming soon)
2. **Manual deployment**: Clone the [repository](https://github.com/learnwithcc/directus-marketplace-search-mcp)

## Example Responses

```
I found 3 Directus extensions for "charts"!

**directus-extension-tradingview-panel**
A directus panel that show tradingview charts.
[View on GitHub](https://github.com/seymoe/directus-extension-tradingview-panel)

**directus-extension-display-link** (Very popular!)
Display URLs, phone numbers, and emails with a link button in Directus
[View on GitHub](https://github.com/jacoborus/directus-extension-display-link)
```

## Requirements

- Node.js 16+ (for NPX)
- Compatible MCP client (Claude Desktop, custom implementations)

## Support

- **Issues**: [GitHub Issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues)
- **Documentation**: [Full Documentation](https://github.com/learnwithcc/directus-marketplace-search-mcp)
- **Server Status**: [Health Check](https://directus-marketplace-search-mcp.focuslab.workers.dev/health)

## Related Projects

- [Directus](https://directus.io/) - Open-source data platform
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol for AI-context integration
- [mcp-remote](https://www.npmjs.com/package/mcp-remote) - Remote MCP connection utility

---

Built with ❤️ for the Directus community

🤖 *Powered by [Claude Code](https://claude.ai/code)*