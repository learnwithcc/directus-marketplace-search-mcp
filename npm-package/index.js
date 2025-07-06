#!/usr/bin/env node

/**
 * Directus Marketplace MCP NPX Package
 * 
 * This package provides easy access to the Directus Marketplace Search MCP server
 * running on Cloudflare Workers. It uses mcp-remote to connect to the hosted server.
 */

const { spawn } = require('child_process');
const path = require('path');

const SERVER_URL = 'https://directus-marketplace-search-mcp.focuslab.workers.dev/mcp';

function main() {
  console.log('🚀 Starting Directus Marketplace Search MCP Server...');
  console.log(`📡 Connecting to: ${SERVER_URL}`);
  console.log('');
  console.log('Available tools:');
  console.log('  • search_extensions - Search Directus marketplace extensions');
  console.log('  • get_extension_details - Get detailed information about an extension');
  console.log('  • get_extension_categories - List all available extension categories');
  console.log('');
  console.log('Rate limits: 100 requests/hour, 500 requests/day per IP');
  console.log('For unlimited access, deploy your own instance: https://github.com/learnwithcc/directus-marketplace-search-mcp');
  console.log('');

  // Check if mcp-remote is available
  try {
    const mcpRemote = spawn('npx', ['mcp-remote', SERVER_URL], {
      stdio: 'inherit',
      shell: true
    });

    mcpRemote.on('error', (error) => {
      console.error('❌ Failed to start MCP remote connection:');
      console.error(error.message);
      console.log('');
      console.log('💡 Try installing mcp-remote globally:');
      console.log('   npm install -g mcp-remote');
      console.log('');
      console.log('🔧 Or use with Claude Desktop directly:');
      console.log('   Add this to your ~/.claude/claude_desktop_config.json:');
      console.log(`   {
     "mcpServers": {
       "directus-marketplace": {
         "command": "npx",
         "args": ["mcp-remote", "${SERVER_URL}"]
       }
     }
   }`);
      process.exit(1);
    });

    mcpRemote.on('exit', (code) => {
      if (code !== 0) {
        console.log('');
        console.log('❌ MCP connection ended unexpectedly');
        console.log('');
        console.log('💡 Alternative usage methods:');
        console.log('1. With Claude Desktop - add to ~/.claude/claude_desktop_config.json:');
        console.log(`   {
     "mcpServers": {
       "directus-marketplace": {
         "command": "npx",
         "args": ["directus-marketplace-mcp"]
       }
     }
   }`);
        console.log('');
        console.log('2. Direct connection with any MCP client:');
        console.log(`   Server URL: ${SERVER_URL}`);
        console.log('   Protocol: Streamable HTTP (2024-11-05, 2025-06-18)');
        console.log('');
        console.log('📖 Documentation: https://github.com/learnwithcc/directus-marketplace-search-mcp');
      }
      process.exit(code);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\\n👋 Goodbye!');
      mcpRemote.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      mcpRemote.kill('SIGTERM');
    });

  } catch (error) {
    console.error('❌ Error starting MCP connection:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, SERVER_URL };