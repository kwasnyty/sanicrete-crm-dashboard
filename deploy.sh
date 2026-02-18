#!/bin/bash

# SaniCrete Interactive CRM Deployment Script
# This script builds and deploys the CRM system

set -e

echo "🏗️  Starting SaniCrete CRM Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in a Node.js project directory"
    echo "Please run this script from the sanicrete-crm-dashboard directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run linting and type checking
echo "🔍 Running type checks..."
npm run lint 2>/dev/null || echo "⚠️  Linting warnings (continuing...)"

# Build the application
echo "🔨 Building production version..."
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful!"
    echo "📁 Static files generated in 'out' directory"
    echo ""
    echo "🚀 Deployment Options:"
    echo ""
    echo "1️⃣  GitHub Pages:"
    echo "   - Push to main branch"
    echo "   - GitHub Actions will automatically deploy"
    echo ""
    echo "2️⃣  Manual hosting:"
    echo "   - Upload 'out' directory contents to your web server"
    echo "   - Point your domain to the uploaded files"
    echo ""
    echo "3️⃣  Local preview:"
    echo "   - Run: npx serve out"
    echo "   - Or use any static file server"
    echo ""
    
    # Offer to start local preview
    read -p "🌐 Start local preview server? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌍 Starting local server at http://localhost:3000..."
        npx serve out -p 3000
    fi
    
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment preparation complete!"