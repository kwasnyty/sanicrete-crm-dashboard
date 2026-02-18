#!/bin/bash
# SaniCrete CRM System Deployment Script

echo "🚀 SaniCrete CRM System Deployment"
echo "==================================="
echo ""

# Check if this is first run
if [ ! -f ".crm_setup_complete" ]; then
    echo "📋 First-time setup detected. Running CRM setup..."
    ./setup-crm.sh
    
    if [ $? -eq 0 ]; then
        touch .crm_setup_complete
        echo "✅ Setup completed successfully!"
    else
        echo "❌ Setup failed. Please check errors above."
        exit 1
    fi
    echo ""
fi

echo "🌐 Deploying SaniCrete CRM System..."
echo ""
echo "Available Interfaces:"
echo "  📊 CRM System: http://localhost:8000/crm-system.html"
echo "  📈 Analytics Dashboard: http://localhost:8000/index.html"
echo ""
echo "Production Deployment Options:"
echo ""
echo "1. 🌍 GitHub Pages (Free):"
echo "   • Create repository: sanicrete-crm-dashboard"
echo "   • Push code: git remote add origin <github-url>"
echo "   • Enable Pages in repo settings"
echo ""
echo "2. 🚀 Netlify (Free with forms):"
echo "   • Drag & drop folder to netlify.com"
echo "   • Auto-deploy from GitHub"
echo ""
echo "3. 🔒 Private Server:"
echo "   • Upload files to web server"
echo "   • Ensure Python3 available for automations"
echo ""
echo "For now, starting local development server..."
echo "Press Ctrl+C to stop and choose production deployment"
echo ""

# Give user time to read
sleep 5

# Start development server
./start-crm.sh