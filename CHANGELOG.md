# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-15

### Added
- 🎉 Initial production release
- Custom MCP server implementation for Cloudflare Workers compatibility
- MCP protocol support for versions 2024-11-05 and 2025-06-18
- Three core search tools:
  - `search_extensions` - Search Directus marketplace extensions
  - `get_extension_details` - Get detailed extension information
  - `get_extension_categories` - List available extension categories
- IP-based rate limiting (configurable)
  - 100 requests per hour per IP
  - 500 requests per day per IP
- Workers KV caching layer
  - 5-minute TTL for search results
  - 1-hour TTL for extension details
- Usage monitoring and analytics
  - `/usage` endpoint for personal statistics
  - `/admin/stats` endpoint for server-wide analytics
  - Cost estimation for self-hosted instances
- One-click deployment script
- GitHub Actions CI/CD pipeline
- NPX package for easy distribution
- Comprehensive documentation
  - Main README with setup instructions
  - Deployment guide
  - Testing guide
  - Cloudflare Workers compatibility report
- Health check endpoint (`/health`)
- CORS support with intelligent origin handling
- Input validation using Zod schemas
- Error handling with proper JSON-RPC error codes

### Technical Details
- Runtime: Cloudflare Workers (V8 Isolates)
- Language: TypeScript (strict mode)
- Bundle size: ~200KB (optimized)
- Dependencies: Minimal (only `zod` for validation)
- Global edge deployment: 300+ locations
- Zero cold starts
- Sub-second response times with caching

### Documentation
- README.md - User and developer guide
- CLAUDE.md - Developer workflow and architecture
- deploy/README.md - Deployment instructions
- test-deployment.md - Testing guide
- CLOUDFLARE_WORKERS_MCP_COMPATIBILITY_REPORT.md - Technical analysis

## [Unreleased]

### Planned
- WebSocket support for real-time updates
- Extension version history tracking
- Advanced filtering options (license, author, downloads)
- Bookmark/favorite extensions feature
- Extension dependency graph visualization
- AI-powered extension recommendations
- Integration with Directus Insights API
- Multi-language support for descriptions
- Extension quality scoring
- Community ratings and reviews integration

### Under Consideration
- Durable Objects for stateful sessions
- R2 storage for large datasets
- Analytics Engine integration
- Queue-based background processing
- GraphQL API endpoint
- Extension changelog aggregation
- Automated extension testing reports
- Extension migration guides

---

## Release Notes Format

Each release includes:
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be-removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

## Version History

### Version 1.0.0 (Current)
**Release Date:** 2024-12-15
**Status:** Production Ready

**Highlights:**
- Production-ready MCP server for Directus marketplace search
- Cloudflare Workers deployment with global edge performance
- Configurable rate limiting and caching
- Comprehensive documentation and deployment tools
- Free tier supports most usage patterns

**Migration Notes:**
- This is the initial release, no migration needed

**Breaking Changes:**
- None (initial release)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.

## Links

- [Repository](https://github.com/learnwithcc/directus-marketplace-search-mcp)
- [Issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues)
- [Discussions](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions)
- [Live Server](https://directus-marketplace-search-mcp.focuslab.workers.dev)
