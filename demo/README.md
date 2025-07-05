# Directus Extensions Search Demo

## Quick Start

1. **Run the demo**:
   ```bash
   node test_search.js
   ```

2. **View the HTML demo**:
   Open `directus_extensions_search_demo.html` in your browser

## Real Implementation Setup

### 1. Create a new Directus endpoint extension

```bash
npx create-directus-extension@latest
# Choose: endpoint
# Name: marketplace-search
```

### 2. Install dependencies

```bash
cd directus-extension-marketplace-search
npm install @directus/extensions-registry
```

### 3. Replace the generated code

Copy the code from `real_implementation_example.js` into your `src/index.js`

### 4. Build and deploy

```bash
npm run build

# Copy the extension to your Directus project
cp -r dist/* /path/to/your/directus/extensions/endpoints/marketplace-search/
```

### 5. Use the API endpoints

```bash
# Search extensions
curl "http://your-directus-url/marketplace-search/search?search=interface&type=interface&limit=5"

# Get extension details
curl "http://your-directus-url/marketplace-search/extension/directus-extension-computed-interface"

# Health check
curl "http://your-directus-url/marketplace-search/health"
```

## API Reference

### Search Extensions
`GET /marketplace-search/search`

**Query Parameters:**
- `search` (string) - Search term for name, description, or keywords
- `type` (string) - Filter by extension type (interface, display, layout, etc.)
- `sandbox` (boolean) - Filter by sandbox compatibility
- `sort` (string) - Sort order: popular, recent, downloads
- `limit` (number) - Maximum results per page (default: 20)
- `offset` (number) - Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "extension-id",
      "name": "Extension Name",
      "type": "interface",
      "description": "Extension description",
      "author": { "name": "Author", "email": "email@example.com" },
      "version": "1.0.0",
      "downloads": 1000,
      "lastUpdated": "2024-12-15T10:30:00Z",
      "sandbox": true,
      "license": "MIT",
      "keywords": ["directus-extension", "interface"]
    }
  ],
  "meta": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Extension Details
`GET /marketplace-search/extension/:id`

Returns detailed information about a specific extension including README, changelog, and dependencies.

## Frontend Integration

You can integrate this API with any frontend framework. The included HTML demo shows a basic implementation using vanilla JavaScript.

For React/Vue applications, you would make HTTP requests to these endpoints and display the results in your custom UI.