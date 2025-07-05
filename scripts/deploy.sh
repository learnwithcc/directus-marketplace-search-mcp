#!/bin/bash

# Directus Marketplace Search MCP Server - Deployment Script
# This script handles the complete deployment process to Cloudflare Workers

set -e  # Exit on any error

echo "🚀 Starting deployment of Directus Marketplace Search MCP Server..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "   wrangler login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run type-check || {
    echo "❌ TypeScript compilation failed. Please fix errors before deploying."
    exit 1
}

# Build the project
echo "🏗️ Building project..."
npm run build || {
    echo "❌ Build failed. Please check your code."
    exit 1
}

# Create KV namespace if it doesn't exist
echo "🗄️ Setting up KV namespace..."
KV_NAMESPACE_ID=$(wrangler kv:namespace create "CACHE" --preview false 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2 || echo "")
PREVIEW_KV_NAMESPACE_ID=$(wrangler kv:namespace create "CACHE" --preview true 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2 || echo "")

if [ -n "$KV_NAMESPACE_ID" ]; then
    echo "✅ KV namespace created: $KV_NAMESPACE_ID"
    
    # Update wrangler.toml with the actual KV namespace ID
    sed -i.backup "s/your-kv-namespace-id/$KV_NAMESPACE_ID/g" wrangler.toml
    sed -i.backup "s/your-preview-kv-namespace-id/$PREVIEW_KV_NAMESPACE_ID/g" wrangler.toml
    echo "✅ Updated wrangler.toml with KV namespace IDs"
else
    echo "⚠️ KV namespace might already exist, continuing with deployment..."
fi

# Deploy to Cloudflare Workers
echo "🌐 Deploying to Cloudflare Workers..."
wrangler deploy

# Get the deployment URL
WORKER_URL=$(wrangler deployments list --name directus-marketplace-search-mcp 2>/dev/null | grep "https://" | head -1 | awk '{print $1}' || echo "https://directus-marketplace-search-mcp.your-subdomain.workers.dev")

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Your MCP server is now available at:"
echo "   $WORKER_URL"
echo ""
echo "🔗 Available endpoints:"
echo "   Health check: $WORKER_URL/health"
echo "   MCP endpoint: $WORKER_URL/mcp"
echo "   API info:     $WORKER_URL/"
echo ""
echo "📖 To test your deployment:"
echo "   curl $WORKER_URL/health"
echo ""
echo "🛠️ To view logs:"
echo "   wrangler tail"
echo ""
echo "⚡ Your MCP server is now running on Cloudflare's global edge network!"