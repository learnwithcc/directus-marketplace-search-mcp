// Directus extension types based on npm registry API response
export interface DirectusExtension {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  sanitized_name: string;
  publisher: {
    email: string;
    username: string;
  };
  maintainers: Array<{
    email: string;
    username: string;
  }>;
  license: string;
  date: string;
  links: {
    homepage?: string;
    repository?: string;
    bugs?: string;
    npm: string;
  };
}

export interface ExtensionSearchResult {
  downloads: {
    monthly: number;
    weekly: number;
  };
  dependents: string;
  updated: string;
  searchScore: number;
  package: DirectusExtension;
}

export interface NPMSearchResponse {
  objects: ExtensionSearchResult[];
  total: number;
  time: string;
}

export interface SearchParams {
  query: string;
  category?: ExtensionCategory;
  limit?: number;
  offset?: number;
  sort?: SortOption;
}

export type ExtensionCategory = 
  | 'interfaces' 
  | 'displays' 
  | 'layouts' 
  | 'panels' 
  | 'modules' 
  | 'hooks' 
  | 'endpoints' 
  | 'operations' 
  | 'themes';

export type SortOption = 'relevance' | 'downloads' | 'updated' | 'created';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface SearchCacheKey {
  query: string;
  category?: ExtensionCategory;
  limit: number;
  offset: number;
  sort: SortOption;
}