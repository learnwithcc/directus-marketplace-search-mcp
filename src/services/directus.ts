/**
 * Directus Marketplace Search Service
 * Uses npm registry API to search for Directus extensions
 */

import type { Env } from '../types/worker.js';
import type { 
  SearchParams, 
  NPMSearchResponse, 
  DirectusExtension,
  ExtensionCategory 
} from '../types/directus.js';
import { CacheService } from './cache.js';

export class DirectusSearchService {
  private cacheService: CacheService;
  private readonly NPM_REGISTRY_BASE = 'https://registry.npmjs.org';
  private readonly NPM_SEARCH_BASE = 'https://registry.npmjs.org/-/v1/search';

  constructor(private env: Env) {
    this.cacheService = new CacheService(env.CACHE);
  }

  async searchExtensions(params: SearchParams): Promise<NPMSearchResponse> {
    const cacheKey = this.generateCacheKey(params);
    
    // Try cache first
    const cached = await this.cacheService.get<NPMSearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build search query
    const searchText = this.buildSearchQuery(params);
    const searchUrl = new URL(this.NPM_SEARCH_BASE);
    
    searchUrl.searchParams.set('text', searchText);
    searchUrl.searchParams.set('size', (params.limit || 10).toString());
    searchUrl.searchParams.set('from', (params.offset || 0).toString());
    
    // Add sorting parameters
    if (params.sort === 'downloads') {
      searchUrl.searchParams.set('popularity', '1.0');
      searchUrl.searchParams.set('quality', '0.1');
      searchUrl.searchParams.set('maintenance', '0.1');
    } else if (params.sort === 'updated') {
      searchUrl.searchParams.set('maintenance', '1.0');
      searchUrl.searchParams.set('quality', '0.1');
      searchUrl.searchParams.set('popularity', '0.1');
    } else {
      // Default relevance scoring
      searchUrl.searchParams.set('quality', '0.65');
      searchUrl.searchParams.set('popularity', '0.98');
      searchUrl.searchParams.set('maintenance', '0.5');
    }

    try {
      const response = await fetch(searchUrl.toString(), {
        headers: {
          'User-Agent': 'directus-marketplace-search-mcp/1.0.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`npm registry API error: ${response.status} ${response.statusText}`);
      }

      const data: NPMSearchResponse = await response.json();
      
      // Filter results to only include Directus extensions
      const filteredData = {
        ...data,
        objects: data.objects.filter(item => this.isDirectusExtension(item.package))
      };

      // Cache the result for 5 minutes
      await this.cacheService.set(cacheKey, filteredData, 300);
      
      return filteredData;
    } catch (error) {
      console.error('Search extensions error:', error);
      throw new Error(`Failed to search extensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExtensionDetails(packageName: string): Promise<DirectusExtension> {
    const cacheKey = `extension:${packageName}`;
    
    // Try cache first
    const cached = await this.cacheService.get<DirectusExtension>(cacheKey);
    if (cached) {
      return cached;
    }

    const packageUrl = `${this.NPM_REGISTRY_BASE}/${encodeURIComponent(packageName)}`;
    
    try {
      const response = await fetch(packageUrl, {
        headers: {
          'User-Agent': 'directus-marketplace-search-mcp/1.0.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Extension '${packageName}' not found`);
        }
        throw new Error(`npm registry API error: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      
      // Extract the latest version info
      const latestVersion = data['dist-tags']?.latest;
      if (!latestVersion || !data.versions?.[latestVersion]) {
        throw new Error(`No valid version found for '${packageName}'`);
      }

      const versionData = data.versions[latestVersion];
      
      const extension: DirectusExtension = {
        name: data.name,
        version: latestVersion,
        description: versionData.description || data.description || '',
        keywords: versionData.keywords || [],
        sanitized_name: data.name,
        publisher: {
          email: data.maintainers?.[0]?.email || '',
          username: data.maintainers?.[0]?.name || ''
        },
        maintainers: data.maintainers?.map((m: any) => ({
          email: m.email,
          username: m.name
        })) || [],
        license: versionData.license || data.license || '',
        date: data.time?.[latestVersion] || data.time?.created || '',
        links: {
          homepage: versionData.homepage || data.homepage,
          repository: versionData.repository?.url || data.repository?.url,
          bugs: versionData.bugs?.url || data.bugs?.url,
          npm: `https://www.npmjs.com/package/${data.name}`
        }
      };

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, extension, 3600);
      
      return extension;
    } catch (error) {
      console.error('Get extension details error:', error);
      throw new Error(`Failed to get extension details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildSearchQuery(params: SearchParams): string {
    let query = `keywords:directus-extension ${params.query}`;
    
    // Add category-specific keywords
    if (params.category) {
      const categoryKeywords = this.getCategoryKeywords(params.category);
      if (categoryKeywords) {
        query += ` keywords:${categoryKeywords}`;
      }
    }
    
    return query;
  }

  private getCategoryKeywords(category: ExtensionCategory): string | null {
    const categoryMap: Record<ExtensionCategory, string> = {
      'interfaces': 'directus-custom-interface',
      'displays': 'directus-custom-display',
      'layouts': 'directus-custom-layout',
      'panels': 'directus-custom-panel',
      'modules': 'directus-custom-module',
      'hooks': 'directus-custom-hook',
      'endpoints': 'directus-custom-endpoint',
      'operations': 'directus-custom-operation',
      'themes': 'directus-theme'
    };
    
    return categoryMap[category] || null;
  }

  private isDirectusExtension(pkg: DirectusExtension): boolean {
    // Check if package has directus-extension keyword
    const hasDirectusKeyword = pkg.keywords?.some(keyword => 
      keyword.includes('directus-extension') || 
      keyword.includes('directus-custom') ||
      keyword.includes('directus-theme')
    );
    
    // Check if package name indicates it's a Directus extension
    const hasDirectusName = pkg.name.includes('directus') && 
      (pkg.name.includes('extension') || 
       pkg.name.includes('interface') || 
       pkg.name.includes('display') || 
       pkg.name.includes('layout') || 
       pkg.name.includes('panel') || 
       pkg.name.includes('module') || 
       pkg.name.includes('hook') || 
       pkg.name.includes('theme'));

    return hasDirectusKeyword || hasDirectusName;
  }

  private generateCacheKey(params: SearchParams): string {
    const keyObj = {
      query: params.query,
      category: params.category || null,
      limit: params.limit || 10,
      offset: params.offset || 0,
      sort: params.sort || 'relevance'
    };
    
    return `search:${btoa(JSON.stringify(keyObj))}`;
  }
}