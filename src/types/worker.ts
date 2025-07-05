// Cloudflare Worker environment interface
export interface Env {
  // KV namespace for caching
  CACHE: KVNamespace;
  
  // Environment variables
  ENVIRONMENT: string;
  DIRECTUS_API_TOKEN?: string;
  
  // Analytics (optional)
  ANALYTICS?: AnalyticsEngineDataset;
}

// Extension binding for Cloudflare Workers
declare global {
  function getMiniflareBindings(): Env;
}