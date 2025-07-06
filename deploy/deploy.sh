#!/bin/bash

# One-Click Deploy Script for Directus Marketplace Search MCP
# This script sets up and deploys your own instance to Cloudflare Workers

set -e

echo "🚀 Directus Marketplace Search MCP - One-Click Deploy"
echo "=================================================================="
echo ""

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        echo "   Please install Node.js 20+ from https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required but not installed."
        echo "   Please install npm (usually comes with Node.js)"
        exit 1
    fi
    
    echo "✅ Node.js $(node --version) found"
    echo "✅ npm $(npm --version) found"
    echo ""
}

# Check if wrangler is available
setup_wrangler() {
    echo "🛠️ Setting up Wrangler CLI..."
    
    if ! command -v wrangler &> /dev/null; then
        echo "📦 Installing Wrangler CLI..."
        npm install -g wrangler
    else
        echo "✅ Wrangler CLI already installed"
    fi
    
    echo ""
}

# Login to Cloudflare
cloudflare_login() {
    echo "🔐 Cloudflare Authentication"
    echo "You'll need to log in to your Cloudflare account..."
    echo ""
    
    if ! wrangler whoami &> /dev/null; then
        echo "🌐 Opening Cloudflare login..."
        wrangler login
    else
        echo "✅ Already logged in to Cloudflare"
        wrangler whoami
    fi
    echo ""
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
}

# Create KV namespace
setup_kv() {
    echo "🗄️ Setting up KV namespace for caching..."
    
    # Create KV namespace and capture the output
    if KV_OUTPUT=$(wrangler kv:namespace create "CACHE" 2>&1); then
        echo "✅ KV namespace created successfully"
        
        # Extract namespace ID from output
        if echo "$KV_OUTPUT" | grep -q "id ="; then
            KV_ID=$(echo "$KV_OUTPUT" | grep "id =" | head -1 | sed 's/.*id = "\([^"]*\)".*/\1/')
            echo "📝 KV Namespace ID: $KV_ID"
            
            # Update wrangler.toml with the KV namespace ID
            if [ -f "wrangler.toml" ]; then
                # Create backup
                cp wrangler.toml wrangler.toml.backup
                
                # Replace placeholder with actual ID
                sed -i.tmp "s/YOUR_KV_NAMESPACE_ID/$KV_ID/g" wrangler.toml
                rm wrangler.toml.tmp
                
                echo "✅ Updated wrangler.toml with KV namespace ID"
            fi
        else
            echo "⚠️ Could not extract KV namespace ID from output"
            echo "Please manually update wrangler.toml with the namespace ID"
        fi
    else
        echo "⚠️ KV namespace might already exist or there was an error"
        echo "Continuing with deployment..."
    fi
    echo ""
}

# Build the project
build_project() {
    echo "🏗️ Building project..."
    npm run build
    echo "✅ Build completed"
    echo ""
}

# Deploy to Cloudflare Workers
deploy_worker() {
    echo "🌐 Deploying to Cloudflare Workers..."
    
    if wrangler deploy; then
        echo ""
        echo "🎉 Deployment successful!"
        echo ""
        
        # Get the deployment URL
        if DEPLOY_URL=$(wrangler status 2>&1 | grep -o 'https://[^[:space:]]*\.workers\.dev' | head -1); then
            echo "📍 Your MCP server is now available at:"
            echo "   $DEPLOY_URL"
            echo ""
            echo "🔗 Available endpoints:"
            echo "   Health:     $DEPLOY_URL/health"
            echo "   MCP:        $DEPLOY_URL/mcp"
            echo "   Usage:      $DEPLOY_URL/usage"
            echo "   Stats:      $DEPLOY_URL/admin/stats"
            echo ""
            
            # Test the deployment
            echo "🧪 Testing deployment..."
            if curl -s "$DEPLOY_URL/health" > /dev/null; then
                echo "✅ Health check passed"
            else
                echo "⚠️ Health check failed - but deployment might still be working"
            fi
        else
            echo "⚠️ Could not determine deployment URL"
            echo "Check your Cloudflare Workers dashboard for the URL"
        fi
    else
        echo "❌ Deployment failed"
        echo "Please check the error messages above and try again"
        exit 1
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎯 Next Steps:"
    echo "=================================================================="
    echo ""
    echo "1. 🧪 Test your deployment:"
    echo "   curl $DEPLOY_URL/health"
    echo ""
    echo "2. 🤖 Configure Claude Desktop:"
    echo "   Add this to ~/.claude/claude_desktop_config.json:"
    echo '   {'
    echo '     "mcpServers": {'
    echo '       "directus-marketplace": {'
    echo '         "command": "npx",'
    echo '         "args": ["mcp-remote", "'$DEPLOY_URL'/mcp"]'
    echo '       }'
    echo '     }'
    echo '   }'
    echo ""
    echo "3. 📊 Monitor usage:"
    echo "   Visit: $DEPLOY_URL/admin/stats"
    echo ""
    echo "4. 🔄 Update your instance:"
    echo "   git pull origin main && npm run deploy"
    echo ""
    echo "💡 For help and documentation:"
    echo "   https://github.com/learnwithcc/directus-marketplace-search-mcp"
    echo ""
    echo "🎉 Enjoy your unlimited Directus Marketplace Search MCP server!"
}

# Main execution
main() {
    check_requirements
    setup_wrangler
    cloudflare_login
    install_deps
    setup_kv
    build_project
    deploy_worker
    show_next_steps
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi