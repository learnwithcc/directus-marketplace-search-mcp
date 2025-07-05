# Create a test script that shows how to use the search functionality
test_script = """// test_search.js
// Test script to demonstrate the marketplace search functionality

/**
 * This script demonstrates how to search for Directus extensions
 * using the extensions registry API approach we discussed.
 */

// Mock implementation of the extensions registry list function
// In a real implementation, you would import from '@directus/extensions-registry'
async function mockRegistryList(searchParams = {}) {
  // Simulate the API response structure
  const allExtensions = [
    {
      id: 'directus-extension-computed-interface',
      name: 'Computed Interface',
      type: 'interface',
      description: 'Automatically calculate field values based on other fields with support for templating and arithmetic operations.',
      author: { name: 'rezo-zero', email: 'dev@rezo-zero.com' },
      version: '1.2.0',
      downloads: 12543,
      lastUpdated: '2024-12-15T10:30:00Z',
      sandbox: true,
      license: 'MIT',
      keywords: ['directus-extension', 'interface', 'computed']
    },
    {
      id: 'directus-extension-simple-currency',
      name: 'Simple Currency Field',
      type: 'interface',
      description: 'A simple and efficient way to handle currency fields with multiple locale support.',
      author: { name: 'joggienl', email: 'joggie@example.com' },
      version: '1.0.4',
      downloads: 8234,
      lastUpdated: '2024-12-10T08:15:00Z',
      sandbox: true,
      license: 'MIT',
      keywords: ['directus-extension', 'interface', 'currency']
    },
    {
      id: 'directus-extension-gantt-layout',
      name: 'Gantt Chart Layout',
      type: 'layout',
      description: 'Display your data as a Gantt chart for project management and timeline visualization.',
      author: { name: 'directus-community', email: 'community@directus.io' },
      version: '2.1.0',
      downloads: 15678,
      lastUpdated: '2024-12-12T14:20:00Z',
      sandbox: false,
      license: 'MIT',
      keywords: ['directus-extension', 'layout', 'gantt', 'project-management']
    },
    {
      id: 'directus-extension-pdf-viewer',
      name: 'PDF Viewer Display',
      type: 'display',
      description: 'View PDF files directly in the Data Studio without downloading them.',
      author: { name: 'community-dev', email: 'dev@community.com' },
      version: '1.3.2',
      downloads: 9876,
      lastUpdated: '2024-12-08T16:45:00Z',
      sandbox: true,
      license: 'Apache-2.0',
      keywords: ['directus-extension', 'display', 'pdf', 'viewer']
    },
    {
      id: 'directus-extension-dark-theme',
      name: 'Professional Dark Theme',
      type: 'theme',
      description: 'A sleek dark theme for the Directus Data Studio with customizable accent colors.',
      author: { name: 'theme-studio', email: 'themes@studio.com' },
      version: '2.0.1',
      downloads: 23456,
      lastUpdated: '2024-12-14T11:30:00Z',
      sandbox: false,
      license: 'MIT',
      keywords: ['directus-extension', 'theme', 'dark', 'ui']
    }
  ];

  // Apply filters
  let filtered = allExtensions;

  // Search filter
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase();
    filtered = filtered.filter(ext => 
      ext.name.toLowerCase().includes(searchTerm) ||
      ext.description.toLowerCase().includes(searchTerm) ||
      ext.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  // Type filter
  if (searchParams.type) {
    filtered = filtered.filter(ext => ext.type === searchParams.type);
  }

  // Sandbox filter
  if (searchParams.sandbox !== undefined) {
    filtered = filtered.filter(ext => ext.sandbox === searchParams.sandbox);
  }

  // Sort results
  const sortBy = searchParams.sort || 'popular';
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case 'downloads':
      case 'popular':
      default:
        return b.downloads - a.downloads;
    }
  });

  // Apply pagination
  const limit = searchParams.limit || 20;
  const offset = searchParams.offset || 0;
  const paginatedResults = filtered.slice(offset, offset + limit);

  return {
    data: paginatedResults,
    meta: {
      total: filtered.length,
      limit: limit,
      offset: offset,
      hasNext: offset + limit < filtered.length
    }
  };
}

// Main search function that mimics the registry API
async function searchExtensions(query = {}) {
  console.log('🔍 Searching extensions with query:', query);
  console.log('─'.repeat(60));

  try {
    const results = await mockRegistryList(query);
    
    console.log(`📊 Found ${results.meta.total} extensions (showing ${results.data.length})`);
    console.log('');

    results.data.forEach((ext, index) => {
      console.log(`${index + 1}. ${ext.name} (${ext.type})`);
      console.log(`   📝 ${ext.description}`);
      console.log(`   👤 by ${ext.author.name} • v${ext.version}`);
      console.log(`   📈 ${ext.downloads.toLocaleString()} downloads • Updated ${ext.lastUpdated.split('T')[0]}`);
      console.log(`   🏷️  ${ext.keywords.join(', ')}`);
      console.log(`   ${ext.sandbox ? '🟢 Sandboxed' : '🔴 Non-sandboxed'} • License: ${ext.license}`);
      console.log('');
    });

    return results;

  } catch (error) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
}

// Demo function to show different search scenarios
async function runSearchDemo() {
  console.log('🚀 Directus Extensions Search Demo');
  console.log('═'.repeat(60));
  console.log('');

  // Test 1: Search for interfaces
  console.log('Test 1: Search for interface extensions');
  await searchExtensions({ type: 'interface' });

  console.log('\\n' + '═'.repeat(60) + '\\n');

  // Test 2: Search by keyword
  console.log('Test 2: Search for "currency" extensions');
  await searchExtensions({ search: 'currency' });

  console.log('\\n' + '═'.repeat(60) + '\\n');

  // Test 3: Search sandboxed extensions only
  console.log('Test 3: Search for sandboxed extensions');
  await searchExtensions({ sandbox: true, limit: 3 });

  console.log('\\n' + '═'.repeat(60) + '\\n');

  // Test 4: Sort by recent updates
  console.log('Test 4: Most recently updated extensions');
  await searchExtensions({ sort: 'recent', limit: 3 });

  console.log('\\n' + '═'.repeat(60) + '\\n');

  // Test 5: Complex search
  console.log('Test 5: Search for "theme" with specific filters');
  await searchExtensions({ 
    search: 'theme',
    sort: 'downloads',
    limit: 2
  });
}

// Usage examples
async function usageExamples() {
  console.log('📚 Usage Examples');
  console.log('═'.repeat(60));
  console.log('');

  console.log('// Basic search');
  console.log('const results = await searchExtensions({ search: "interface" });');
  console.log('');

  console.log('// Search with filters');
  console.log('const results = await searchExtensions({');
  console.log('  type: "interface",');
  console.log('  sandbox: true,');
  console.log('  sort: "recent",');
  console.log('  limit: 10');
  console.log('});');
  console.log('');

  console.log('// Available filter options:');
  console.log('// - search: string (searches name, description, keywords)');
  console.log('// - type: "interface" | "display" | "layout" | "module" | "panel" | "theme" | "hook" | "endpoint" | "operation"');
  console.log('// - sandbox: boolean (true for sandboxed extensions only)');
  console.log('// - sort: "popular" | "recent" | "downloads"');
  console.log('// - limit: number (default: 20)');
  console.log('// - offset: number (default: 0)');
  console.log('');
}

// Run the demo
if (require.main === module) {
  (async () => {
    try {
      await usageExamples();
      await runSearchDemo();
      
      console.log('✅ Demo completed successfully!');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Install @directus/extensions-registry package');
      console.log('2. Replace mockRegistryList with actual registry.list() calls');
      console.log('3. Deploy as a Directus endpoint extension');
      console.log('4. Integrate with your frontend application');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  })();
}

// Export for use in other modules
module.exports = {
  searchExtensions,
  mockRegistryList
};"""

# Create installation instructions
install_instructions = """# Directus Extensions Search Demo

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

For React/Vue applications, you would make HTTP requests to these endpoints and display the results in your custom UI."""

# Save the files
with open('test_search.js', 'w') as f:
    f.write(test_script)

with open('README.md', 'w') as f:
    f.write(install_instructions)

print("✅ Complete demo package created!")
print("\nFiles created:")
print("1. test_search.js - Node.js test script with demo functionality")
print("2. README.md - Installation and usage instructions")
print("3. directus_extensions_search_demo.html - Frontend demo")
print("4. directus_endpoint_extension.js - Directus endpoint extension")
print("5. real_implementation_example.js - Real registry implementation")
print("6. package.json - Extension package configuration")
print("\nTo test the demo:")
print("1. Run: node test_search.js")
print("2. Open: directus_extensions_search_demo.html in your browser")