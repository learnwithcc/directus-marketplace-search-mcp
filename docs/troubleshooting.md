# Troubleshooting Guide

This guide helps you resolve common issues when using or deploying the Directus Marketplace Search MCP Server.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Connection Issues](#connection-issues)
- [Rate Limiting Issues](#rate-limiting-issues)
- [Deployment Issues](#deployment-issues)
- [Development Issues](#development-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

## Installation Issues

### Issue: "I don't see the tools in Claude Desktop"

**Symptoms:**
- MCP server is configured but tools don't appear
- No error messages in Claude Desktop

**Solutions:**

1. **Restart Claude Desktop** completely (quit and reopen)
   ```bash
   # macOS: Quit from menu bar or:
   killall "Claude"
   # Then reopen Claude Desktop
   ```

2. **Check configuration file syntax**
   ```bash
   # Verify JSON syntax is valid
   cat ~/.claude/claude_desktop_config.json | jq .
   ```

   Expected format:
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

3. **Test NPX command directly**
   ```bash
   npx directus-marketplace-mcp
   ```

   This should connect to the server. Press Ctrl+C to exit.

4. **Check Node.js version**
   ```bash
   node --version
   # Should be 16.0.0 or higher
   ```

5. **Clear NPX cache and retry**
   ```bash
   npx clear-npx-cache
   npx directus-marketplace-mcp
   ```

### Issue: "npx command fails"

**Error:**
```
Error: Cannot find module 'directus-marketplace-mcp'
```

**Solutions:**

1. **Check internet connection** - NPX needs to download the package

2. **Use full package path**
   ```json
   {
     "mcpServers": {
       "directus-marketplace": {
         "command": "npx",
         "args": ["-y", "directus-marketplace-mcp"]
       }
     }
   }
   ```

3. **Use remote server URL instead**
   ```json
   {
     "mcpServers": {
       "directus-marketplace": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp"
         ]
       }
     }
   }
   ```

## Connection Issues

### Issue: "Connection timeout" or "Cannot connect to server"

**Solutions:**

1. **Check server health**
   ```bash
   curl https://directus-marketplace-search-mcp.focuslab.workers.dev/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-12-15T10:30:00.000Z",
     "version": "1.0.0"
   }
   ```

2. **Test MCP endpoint**
   ```bash
   curl -X POST https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
   ```

3. **Check firewall/proxy settings**
   - Ensure outbound HTTPS (port 443) is allowed
   - Check corporate proxy settings
   - Try from a different network

4. **Verify DNS resolution**
   ```bash
   nslookup directus-marketplace-search-mcp.focuslab.workers.dev
   ```

### Issue: "Protocol negotiation failed"

**Error:**
```
Unsupported protocol version
```

**Solutions:**

1. **Update Claude Desktop** to latest version

2. **Check MCP version compatibility**
   - Server supports: 2024-11-05 and 2025-06-18
   - Ensure client requests one of these versions

3. **View server supported versions**
   ```bash
   curl https://directus-marketplace-search-mcp.focuslab.workers.dev/
   ```

## Rate Limiting Issues

### Issue: "Rate limit exceeded" or "429 Too Many Requests"

**Symptoms:**
- Error message about rate limiting
- Requests being blocked
- 429 HTTP status code

**Solutions:**

1. **Check your current usage**
   ```bash
   curl https://directus-marketplace-search-mcp.focuslab.workers.dev/usage
   ```

2. **Wait for rate limit reset**
   - Hourly limit resets after 1 hour
   - Daily limit resets after 24 hours
   - Check `X-RateLimit-Reset` header for exact time

3. **Deploy your own unlimited instance**
   - See [Deployment Guide](../deploy/README.md)
   - Takes ~5 minutes
   - No rate limits on self-hosted instances

4. **Optimize your usage**
   - Cache results locally when possible
   - Batch similar queries
   - Avoid redundant searches

### Issue: "Rate limit headers missing"

**Expected headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702648800
```

**Solutions:**

1. **Check if using self-hosted instance**
   - Self-hosted instances may have rate limiting disabled

2. **Verify you're calling the MCP endpoint**
   - Rate limits only apply to `/mcp` endpoint
   - Health check and info endpoints are unlimited

## Deployment Issues

### Issue: "Wrangler login fails"

**Error:**
```
Failed to authenticate with Cloudflare
```

**Solutions:**

1. **Clear existing authentication**
   ```bash
   npx wrangler logout
   npx wrangler login
   ```

2. **Use API token instead**
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token_here
   npx wrangler deploy
   ```

3. **Check browser for authorization**
   - Login opens browser window
   - Complete authentication there
   - Return to terminal

### Issue: "KV namespace creation failed"

**Error:**
```
Error creating KV namespace
```

**Solutions:**

1. **Create manually**
   ```bash
   npx wrangler kv:namespace create "CACHE" --preview false
   npx wrangler kv:namespace create "CACHE" --preview true
   ```

2. **Update wrangler.toml** with the returned IDs
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-kv-namespace-id"
   preview_id = "your-preview-kv-namespace-id"
   ```

3. **Check Cloudflare account limits**
   - Free tier: Limited namespaces
   - Paid tier: More namespaces available

### Issue: "Build fails with TypeScript errors"

**Error:**
```
Type checking failed
```

**Solutions:**

1. **Install dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Run type check manually**
   ```bash
   npm run type-check
   ```

3. **Check TypeScript version**
   ```bash
   npx tsc --version
   # Should be 5.7 or compatible
   ```

4. **Skip type check (not recommended)**
   ```bash
   npm run deploy:quick
   ```

### Issue: "Deployment succeeds but server returns 500 errors"

**Solutions:**

1. **Check deployment logs**
   ```bash
   npx wrangler tail
   ```

2. **Verify KV namespace binding**
   - Check wrangler.toml has correct KV namespace IDs
   - Test KV access in Cloudflare dashboard

3. **Test locally first**
   ```bash
   npm run dev
   curl http://localhost:8787/health
   ```

4. **Check environment variables**
   - Ensure all required env vars are set
   - Verify values in Cloudflare dashboard

## Development Issues

### Issue: "Local development server won't start"

**Error:**
```
Error starting local server
```

**Solutions:**

1. **Check port availability**
   ```bash
   # Default port is 8787
   lsof -i :8787
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Specify different port**
   ```bash
   npx wrangler dev --port 8788
   ```

3. **Clear Wrangler cache**
   ```bash
   rm -rf ~/.wrangler
   npm run dev
   ```

4. **Update Wrangler**
   ```bash
   npm install wrangler@latest
   ```

### Issue: "Tests fail"

**Solutions:**

1. **Install test dependencies**
   ```bash
   npm install --save-dev
   ```

2. **Run tests with verbose output**
   ```bash
   npm test -- --reporter=verbose
   ```

3. **Run specific test file**
   ```bash
   npm test -- path/to/test.ts
   ```

4. **Check Node.js version**
   ```bash
   node --version
   # Should be 20.0.0 or higher
   ```

### Issue: "Linting errors"

**Solutions:**

1. **Auto-fix linting issues**
   ```bash
   npm run lint:fix
   ```

2. **View specific errors**
   ```bash
   npm run lint
   ```

3. **Update ESLint config** if rules are too strict

## Performance Issues

### Issue: "Slow response times"

**Symptoms:**
- Searches take >2 seconds
- Timeout errors

**Solutions:**

1. **Check server status**
   ```bash
   curl -w "@-" -o /dev/null -s https://directus-marketplace-search-mcp.focuslab.workers.dev/health <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
   EOF
   ```

2. **Deploy closer to your users**
   - Self-host for better geographic distribution
   - Cloudflare Workers automatically route to nearest edge

3. **Check cache hit rate**
   ```bash
   curl https://your-worker.workers.dev/admin/stats
   ```

   Low cache hit rate means:
   - Increase cache TTLs
   - More varied queries (normal)

4. **Optimize queries**
   - Use more specific search terms
   - Reduce result limits
   - Filter by category

### Issue: "High costs on self-hosted instance"

**Solutions:**

1. **Monitor usage**
   ```bash
   curl https://your-worker.workers.dev/admin/stats
   ```

2. **Increase cache TTLs**
   - Edit `src/services/directus.ts`
   - Increase TTL values (in seconds)

3. **Enable rate limiting**
   - Edit `src/services/rate-limiter.ts`
   - Set appropriate limits

4. **Review request patterns**
   - Check for unnecessary duplicate requests
   - Implement client-side caching

## No Results Found

### Issue: "Search returns no results"

**Solutions:**

1. **Try broader search terms**
   ```
   Bad:  "directus-extension-computed-interface-color-picker"
   Good: "interface"
   Good: "color picker"
   ```

2. **Check extension categories**
   - Use the categories tool to see available types
   - Filter by specific category

3. **Verify extension exists**
   - Search npm directly: https://www.npmjs.com/search?q=directus-extension
   - Check if package is published

4. **Check for typos** in search query

## Getting Help

If you're still experiencing issues:

### 1. Check Existing Issues

Search the [GitHub Issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues) for similar problems.

### 2. Join Discussions

Ask in [GitHub Discussions](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions).

### 3. Create an Issue

If you've found a bug, create a new issue with:

- **Clear description** of the problem
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment details** (Node version, OS, etc.)
- **Error messages and logs**
- **Screenshots** if applicable

**Issue Template:**
```markdown
**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Node version:
- OS:
- Deployment method:
- Server URL (if self-hosted):

**Error Messages:**
```
Paste error messages here
```

**Additional Context:**
Any other relevant information
```

### 4. Server Health Check

Always include server health status:

```bash
curl https://your-server-url/health
curl https://your-server-url/
```

### 5. Diagnostic Information

Collect diagnostic info:

```bash
# Node and npm versions
node --version
npm --version

# Wrangler version (if deploying)
npx wrangler --version

# Test server connectivity
curl -v https://directus-marketplace-search-mcp.focuslab.workers.dev/health

# Check MCP endpoint
curl -X POST https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Resources

- **Documentation**: [README.md](../README.md)
- **Deployment Guide**: [deploy/README.md](../deploy/README.md)
- **Developer Guide**: [CLAUDE.md](../CLAUDE.md)
- **Contributing Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **GitHub Issues**: https://github.com/learnwithcc/directus-marketplace-search-mcp/issues
- **Live Server**: https://directus-marketplace-search-mcp.focuslab.workers.dev

---

**Last Updated:** 2024-12-15

*Can't find your issue? [Create a new issue](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues/new) or ask in [Discussions](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions).*
