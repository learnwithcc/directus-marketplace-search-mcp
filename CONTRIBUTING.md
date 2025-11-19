# Contributing to Directus Marketplace Search MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (Node version, OS, deployment method)
- **Error messages** and logs if applicable
- **Screenshots** if relevant

**Bug Report Template:**

```markdown
**Description:**
A clear description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Environment:**
- Node version:
- OS:
- Deployment method:
- Browser (if applicable):

**Additional Context:**
Any other relevant information
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** explaining why this would be valuable
- **Detailed explanation** of the proposed feature
- **Alternative approaches** you've considered
- **Examples** from other projects (if applicable)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow coding standards** (see below)
3. **Write clear commit messages** (see below)
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Ensure all tests pass** before submitting
7. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 20 or higher
- npm or pnpm
- Git
- Cloudflare account (for testing deployments)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/directus-marketplace-search-mcp.git
cd directus-marketplace-search-mcp

# Install dependencies
npm install

# Create a development branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Coding Standards

### TypeScript

- Use **strict mode** (already configured)
- Provide **explicit types** for all function parameters and return values
- Avoid `any` type - use `unknown` with type guards if needed
- Use **interfaces** for object shapes, **types** for unions/intersections

**Good:**
```typescript
function searchExtensions(query: string, limit: number): Promise<SearchResult[]> {
  // ...
}
```

**Bad:**
```typescript
function searchExtensions(query, limit) {
  // ...
}
```

### Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Add **semicolons** at end of statements
- Maximum line length: **100 characters**
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and types
- Use **UPPER_CASE** for constants

Run `npm run lint:fix` to automatically fix most style issues.

### Comments and Documentation

- Add **JSDoc comments** for all exported functions and classes
- Use **inline comments** to explain complex logic
- Keep comments **up-to-date** with code changes
- Write comments that explain **why**, not **what**

**Example:**
```typescript
/**
 * Searches the Directus marketplace for extensions matching the query.
 *
 * @param query - Search term for extension name, description, or keywords
 * @param options - Optional search configuration
 * @returns Array of matching extensions with popularity indicators
 * @throws {ValidationError} If query is invalid or too long
 */
export async function searchExtensions(
  query: string,
  options?: SearchOptions
): Promise<ExtensionResult[]> {
  // Cache key includes query params to ensure accurate cache hits
  const cacheKey = `search:${query}:${JSON.stringify(options)}`;
  // ...
}
```

### Error Handling

- Always handle errors explicitly
- Use proper JSON-RPC error codes for MCP responses
- Provide meaningful error messages
- Log errors appropriately

**Example:**
```typescript
try {
  const result = await fetchData();
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    return createErrorResponse(-32602, 'Invalid parameters');
  }
  console.error('Unexpected error:', error);
  return createErrorResponse(-32603, 'Internal error');
}
```

### Testing

- Write **unit tests** for all new functions
- Write **integration tests** for MCP protocol compliance
- Aim for **80%+ code coverage**
- Test **edge cases** and error conditions
- Use **descriptive test names**

**Example:**
```typescript
describe('searchExtensions', () => {
  it('should return results for valid query', async () => {
    const results = await searchExtensions('interface');
    expect(results).toHaveLength(10);
    expect(results[0]).toHaveProperty('name');
  });

  it('should throw error for empty query', async () => {
    await expect(searchExtensions('')).rejects.toThrow(ValidationError);
  });

  it('should respect limit parameter', async () => {
    const results = await searchExtensions('interface', { limit: 5 });
    expect(results).toHaveLength(5);
  });
});
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `ci`: CI/CD configuration changes

### Examples

```
feat(search): add category filtering to search endpoint

Add ability to filter search results by extension category (interface, display, etc.).
Includes new validation rules and updated documentation.

Closes #42
```

```
fix(rate-limiter): correct hourly rate limit calculation

The hourly limit was resetting after 30 minutes instead of 60.
Fixed the TTL calculation in the rate limiter service.

Fixes #38
```

```
docs: update deployment guide with troubleshooting section

Added common deployment issues and their solutions to help users
debug problems during initial setup.
```

## Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   npm run type-check
   npm run lint
   npm test
   ```

2. **Update documentation:**
   - Update README.md if you changed functionality
   - Update CLAUDE.md for developer guidance
   - Add JSDoc comments to new code
   - Update CHANGELOG.md with your changes

3. **Test your changes:**
   - Test locally with `npm run dev`
   - Test deployment with `npm run deploy` (if applicable)
   - Verify MCP protocol compliance

### Submission Guidelines

1. **Create a pull request** with a clear title and description
2. **Link related issues** using keywords (Closes #123, Fixes #456)
3. **Provide context** explaining why this change is needed
4. **Include screenshots** for UI changes
5. **List breaking changes** if any
6. **Request review** from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- Change 1
- Change 2
- Change 3

## Testing
How was this tested? What test cases were added?

## Screenshots (if applicable)
Add screenshots here

## Breaking Changes
List any breaking changes and migration steps

## Checklist
- [ ] Tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

### Review Process

1. Maintainers will review your PR within 3-5 business days
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your changes will be included in the next release

## Project Structure

Understanding the project structure will help you contribute effectively:

```
directus-marketplace-search-mcp/
├── src/                      # Source code
│   ├── index.ts             # Main entry point
│   ├── mcp-simple.ts        # MCP protocol implementation
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── deploy/                   # Deployment resources
├── npm-package/             # NPX package configuration
├── demo/                    # Demo and examples
├── scripts/                 # Build and deployment scripts
├── .github/                 # GitHub Actions workflows
└── docs/                    # Additional documentation
```

## Common Tasks

### Adding a New MCP Tool

1. Define tool schema in `src/mcp-simple.ts` (tools array)
2. Implement handler in `handleToolCall` method
3. Add validation using Zod schemas
4. Write tests in `src/__tests__/` (create if needed)
5. Update README.md documentation
6. Update CHANGELOG.md

### Modifying Rate Limits

1. Edit `src/services/rate-limiter.ts`
2. Update documentation in README.md
3. Add tests for new limits
4. Update deploy guide if configuration changes

### Adding New Endpoints

1. Add route handler in `src/index.ts`
2. Implement CORS headers
3. Add to endpoint list in root response
4. Document in README.md
5. Add integration tests

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/learnwithcc/directus-marketplace-search-mcp/discussions)
- **Issues?** Check [existing issues](https://github.com/learnwithcc/directus-marketplace-search-mcp/issues)
- **Documentation?** See [CLAUDE.md](CLAUDE.md) for developer guidance
- **Chat?** Join our community (link TBD)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to make this project better!

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
