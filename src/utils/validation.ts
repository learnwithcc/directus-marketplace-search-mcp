/**
 * Input validation utilities using Zod
 * Ensures all user inputs are properly validated and sanitized
 */

import { z } from 'zod';
import type { SearchParams, ExtensionCategory, SortOption } from '../types/directus.js';

// Schema for search parameters
const searchParamsSchema = z.object({
  query: z.string()
    .min(1, 'Query cannot be empty')
    .max(100, 'Query too long')
    .transform(sanitizeQuery),
  category: z.enum([
    'interfaces', 
    'displays', 
    'layouts', 
    'panels', 
    'modules', 
    'hooks', 
    'endpoints', 
    'operations', 
    'themes'
  ]).optional(),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
  offset: z.number()
    .min(0, 'Offset cannot be negative')
    .default(0),
  sort: z.enum(['relevance', 'downloads', 'updated', 'created'])
    .default('relevance')
});

// Schema for extension name
const extensionNameSchema = z.string()
  .min(1, 'Extension name cannot be empty')
  .max(100, 'Extension name too long')
  .regex(/^[a-zA-Z0-9\-_.@\/]+$/, 'Invalid extension name format');

/**
 * Validate and sanitize search parameters
 */
export function validateSearchParams(input: any): SearchParams {
  try {
    return searchParamsSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => issue.message).join(', ');
      throw new Error(`Invalid search parameters: ${issues}`);
    }
    throw new Error('Failed to validate search parameters');
  }
}

/**
 * Validate extension name
 */
export function validateExtensionName(input: any): string {
  try {
    return extensionNameSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => issue.message).join(', ');
      throw new Error(`Invalid extension name: ${issues}`);
    }
    throw new Error('Failed to validate extension name');
  }
}

/**
 * Sanitize search query to prevent injection attacks
 */
function sanitizeQuery(query: string): string {
  // Remove potentially dangerous characters
  let sanitized = query
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[;&|`$(){}[\]\\]/g, '') // Remove shell metacharacters
    .replace(/['"]/g, '') // Remove quotes
    .trim();

  // Ensure query is not empty after sanitization
  if (sanitized.length === 0) {
    throw new Error('Query is empty after sanitization');
  }

  return sanitized;
}

/**
 * Validate that a value is a valid extension category
 */
export function isValidCategory(category: string): category is ExtensionCategory {
  const validCategories: ExtensionCategory[] = [
    'interfaces', 
    'displays', 
    'layouts', 
    'panels', 
    'modules', 
    'hooks', 
    'endpoints', 
    'operations', 
    'themes'
  ];
  
  return validCategories.includes(category as ExtensionCategory);
}

/**
 * Validate that a value is a valid sort option
 */
export function isValidSortOption(sort: string): sort is SortOption {
  const validSorts: SortOption[] = ['relevance', 'downloads', 'updated', 'created'];
  return validSorts.includes(sort as SortOption);
}

/**
 * General input sanitization utility
 */
export function sanitizeInput(input: string, maxLength: number = 100): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/[;&|`$(){}[\]\\]/g, '')
    .trim();
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit?: number, offset?: number): { limit: number; offset: number } {
  const validatedLimit = Math.min(Math.max(limit || 10, 1), 50);
  const validatedOffset = Math.max(offset || 0, 0);
  
  return { limit: validatedLimit, offset: validatedOffset };
}