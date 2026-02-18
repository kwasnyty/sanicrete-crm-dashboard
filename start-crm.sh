#!/bin/bash
# SaniCrete CRM System Startup Script

echo "🚀 Starting SaniCrete CRM System"
echo "==============================="
echo ""

# Check if system is set up
if [ ! -d "user_data" ]; then
    echo "⚠️  CRM system not set up yet. Running setup..."
    ./setup-crm.sh
    echo ""
fi

# Check for updates and run quick automation
echo "🔄 Running quick system check..."
python3 crm-automations.py update-scores > /dev/null 2>&1
echo "✅ System check complete"

echo ""
echo "🌐 Starting CRM web server..."
echo ""
echo "📊 SaniCrete CRM Dashboard: http://localhost:8000/crm-system.html"
echo "📈 Analytics Dashboard: http://localhost:8000/index.html" 
echo ""
echo "💡 Features Available:"
echo "   • Interactive prospect management"
echo "   • Follow-up scheduling with reminders"
echo "   • Lead scoring and pipeline tracking"
echo "   • Email template generation"
echo "   • Search and advanced filtering"
echo "   • Data export capabilities"
echo ""
echo "🤖 Automation Status:"
echo "   • Overdue alerts: Daily at 9:00 AM"
echo "   • Score updates: 10:00 AM & 3:00 PM daily"
echo "   • Weekly reports: Friday at 5:00 PM"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""
echo "Starting server in 3 seconds..."
sleep 3

# Start the web server
python3 -m http.server 8000