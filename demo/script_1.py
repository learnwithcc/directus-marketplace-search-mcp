# Create a Directus endpoint extension that provides the search functionality
# This would be the actual implementation using the @directus/extensions-registry package

endpoint_code = """// src/index.js
// Directus Extension: Marketplace Search API
export default {
  id: 'marketplace-search',
  handler: (router, { logger }) => {
    
    // Search extensions endpoint
    router.get('/search', async (req, res) => {
      try {
        // Import the extensions registry (this would need to be installed)
        // npm install @directus/extensions-registry
        // const { list } = await import('@directus/extensions-registry');
        
        // Extract query parameters
        const {
          search = '',
          type = '',
          sort = 'popular',
          limit = 20,
          offset = 0,
          sandbox = ''
        } = req.query;

        // Build search parameters object
        const searchParams = {
          limit: parseInt(limit),
          offset: parseInt(offset)
        };

        // Add type filter if specified
        if (type) {
          searchParams.type = type;
        }

        // Add sort parameter
        if (sort) {
          searchParams.sort = sort;
        }

        // Add sandbox filter if specified
        if (sandbox !== '') {
          searchParams.sandbox = sandbox === 'true';
        }

        // Add search term if provided
        if (search) {
          searchParams.search = search;
        }

        logger.info(`Searching extensions with params:`, searchParams);

        // DEMO: Since we can't actually import the registry in this demo,
        // we'll return mock data that shows the structure
        const mockResponse = {
          data: [
            {
              id: 'directus-extension-computed-interface',
              name: 'Computed Interface',
              type: 'interface',
              description: 'Automatically calculate field values based on other fields',
              author: {
                name: 'rezo-zero',
                email: 'dev@rezo-zero.com'
              },
              version: '1.2.0',
              downloads: 12543,
              lastUpdated: '2024-12-15T10:30:00Z',
              sandbox: true,
              license: 'MIT',
              repository: 'https://github.com/rezo-zero/directus-extension-computed-interface',
              keywords: ['directus-extension', 'interface', 'computed', 'calculation']
            }
          ],
          meta: {
            total: 1,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        };

        // In a real implementation, you would call:
        // const results = await list(searchParams);
        
        res.json(mockResponse);

      } catch (error) {
        logger.error('Error searching extensions:', error);
        res.status(500).json({
          error: 'Failed to search extensions',
          message: error.message
        });
      }
    });

    // Get extension details endpoint
    router.get('/extension/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        logger.info(`Fetching details for extension: ${id}`);

        // In a real implementation, you would fetch from the registry
        const mockExtension = {
          id: id,
          name: 'Sample Extension',
          type: 'interface',
          description: 'A sample extension for demonstration',
          author: {
            name: 'Demo Author',
            email: 'demo@example.com'
          },
          version: '1.0.0',
          downloads: 1000,
          lastUpdated: '2024-12-15T10:30:00Z',
          sandbox: true,
          license: 'MIT',
          readme: '# Sample Extension\\n\\nThis is a demo extension.',
          changelog: '## v1.0.0\\n- Initial release',
          dependencies: {},
          directusVersions: ['^10.0.0'],
          screenshots: [],
          tags: ['interface', 'demo']
        };

        res.json(mockExtension);

      } catch (error) {
        logger.error('Error fetching extension details:', error);
        res.status(500).json({
          error: 'Failed to fetch extension details',
          message: error.message
        });
      }
    });

    // Health check endpoint
    router.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    logger.info('Marketplace Search API endpoints registered');
  }
};"""

# Create the package.json for the extension
package_json = """{
  "name": "directus-extension-marketplace-search",
  "version": "1.0.0",
  "description": "API endpoints for searching Directus marketplace extensions",
  "keywords": [
    "directus",
    "directus-extension",
    "directus-custom-endpoint"
  ],
  "directus:extension": {
    "type": "endpoint",
    "path": "dist/index.js",
    "source": "src/index.js",
    "host": "^10.0.0"
  },
  "main": "dist/index.js",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "directus-extension build",
    "dev": "directus-extension build -w --no-minify"
  },
  "devDependencies": {
    "@directus/extensions-sdk": "^11.0.0"
  },
  "dependencies": {
    "@directus/extensions-registry": "^3.0.7"
  }
}"""

# Real implementation using the actual registry
real_implementation = """// Real implementation example
// This shows how you would actually use the @directus/extensions-registry package

import { list, get } from '@directus/extensions-registry';

export default {
  id: 'marketplace-search',
  handler: (router, { logger }) => {
    
    router.get('/search', async (req, res) => {
      try {
        const {
          search = '',
          type = '',
          sort = 'popular',
          limit = 20,
          offset = 0,
          sandbox = ''
        } = req.query;

        // Build search parameters for the registry
        const searchParams = {
          limit: parseInt(limit),
          offset: parseInt(offset)
        };

        if (type) searchParams.type = type;
        if (sort) searchParams.sort = sort;
        if (sandbox !== '') searchParams.sandbox = sandbox === 'true';
        if (search) searchParams.search = search;

        // Call the actual registry API
        const results = await list(searchParams, {
          registry: 'https://registry.directus.io'
        });

        // Transform the results if needed
        const transformedResults = {
          data: results.data.map(extension => ({
            ...extension,
            // Add any custom fields or transformations
            installCommand: `npm install ${extension.id}`,
            marketplaceUrl: `https://directus.io/marketplace/${extension.id}`
          })),
          meta: results.meta
        };

        res.json(transformedResults);

      } catch (error) {
        logger.error('Registry search error:', error);
        res.status(500).json({
          error: 'Search failed',
          message: error.message
        });
      }
    });

    router.get('/extension/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Get detailed extension information
        const extension = await get(id, {
          registry: 'https://registry.directus.io'
        });

        res.json(extension);

      } catch (error) {
        logger.error('Extension fetch error:', error);
        res.status(500).json({
          error: 'Extension not found',
          message: error.message
        });
      }
    });
  }
};"""

# Save the files
with open('directus_endpoint_extension.js', 'w') as f:
    f.write(endpoint_code)

with open('package.json', 'w') as f:
    f.write(package_json)

with open('real_implementation_example.js', 'w') as f:
    f.write(real_implementation)

print("Created Directus extension files:")
print("- directus_endpoint_extension.js (demo implementation)")
print("- package.json (extension configuration)")
print("- real_implementation_example.js (actual registry usage)")