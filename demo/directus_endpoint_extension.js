// src/index.js
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
          readme: '# Sample Extension\n\nThis is a demo extension.',
          changelog: '## v1.0.0\n- Initial release',
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
};