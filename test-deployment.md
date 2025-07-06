# MCP Server Deployment Test Guide

## Testing the Simplified MCP Server

### 1. Local Testing

```bash
# Build the project
npm run build

# Test locally with Wrangler
wrangler dev --local

# Test in browser or with curl
curl http://localhost:8787/
curl http://localhost:8787/health
```

### 2. Test MCP JSON-RPC Calls

```bash
# Test initialize
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'

# Test tools list
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'

# Test get categories
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_extension_categories",
      "arguments": {}
    }
  }'

# Test search extensions
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "search_extensions",
      "arguments": {
        "query": "interface",
        "limit": 5
      }
    }
  }'
```

### 3. Deploy to Cloudflare Workers

```bash
# Deploy using the script
./scripts/deploy.sh

# Or deploy directly
wrangler deploy
```

### 4. Test Production Deployment

Replace `YOUR_WORKER_URL` with your actual Worker URL:

```bash
# Test production endpoints
curl https://YOUR_WORKER_URL.workers.dev/
curl https://YOUR_WORKER_URL.workers.dev/health

# Test MCP functionality
curl -X POST https://YOUR_WORKER_URL.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

## Expected Responses

### Initialize Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "directus-marketplace-search",
      "version": "1.0.0"
    }
  }
}
```

### Tools List Response
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "search_extensions",
        "description": "Search Directus marketplace extensions by query, category, and other filters",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query for extension name, description, or keywords",
              "minLength": 1,
              "maxLength": 100
            }
          },
          "required": ["query"]
        }
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Make sure all imports use `.js` extensions
2. **KV namespace errors**: Update `wrangler.toml` with actual KV namespace IDs
3. **CORS issues**: The server includes CORS headers for cross-origin requests
4. **JSON-RPC format**: Ensure all requests follow JSON-RPC 2.0 specification

### Debug Commands

```bash
# View deployment logs
wrangler tail

# Test specific endpoints
wrangler dev --local --port 8787

# Check build output
ls -la dist/
```