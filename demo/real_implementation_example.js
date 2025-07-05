// Real implementation example
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
};