#!/bin/bash
# SaniCrete CRM System Setup Script
# Installs CRM system with automations and OpenClaw integration

echo "🚀 SaniCrete CRM System Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "crm-system.html" ]; then
    echo "❌ Error: Please run this script from the sanicrete-crm-dashboard directory"
    exit 1
fi

# Make automation script executable
echo "📋 Setting up automation scripts..."
chmod +x crm-automations.py

# Create user data directory
mkdir -p user_data
echo "📁 Created user data directory"

# Setup OpenClaw cron jobs for automations
echo ""
echo "⏰ Setting up automated CRM tasks..."

# Daily overdue check (9:00 AM)
echo "Setting up daily overdue follow-up check..."
openclaw cron create \
    --name "crm_daily_overdue_check" \
    --schedule "0 9 * * *" \
    --command "cd $(pwd) && python3 crm-automations.py check-overdue" \
    --description "Daily check for overdue CRM follow-ups"

# Twice-daily score updates (10:00 AM and 3:00 PM)
echo "Setting up automated lead scoring..."
openclaw cron create \
    --name "crm_score_update_morning" \
    --schedule "0 10 * * *" \
    --command "cd $(pwd) && python3 crm-automations.py update-scores" \
    --description "Morning CRM lead score updates"

openclaw cron create \
    --name "crm_score_update_afternoon" \
    --schedule "0 15 * * *" \
    --command "cd $(pwd) && python3 crm-automations.py update-scores" \
    --description "Afternoon CRM lead score updates"

# Weekly pipeline automation (Monday 8:00 AM)
echo "Setting up weekly pipeline automation..."
openclaw cron create \
    --name "crm_weekly_pipeline" \
    --schedule "0 8 * * 1" \
    --command "cd $(pwd) && python3 crm-automations.py pipeline-automation" \
    --description "Weekly CRM pipeline automation"

# Weekly report (Friday 5:00 PM)
echo "Setting up weekly reporting..."
openclaw cron create \
    --name "crm_weekly_report" \
    --schedule "0 17 * * 5" \
    --command "cd $(pwd) && python3 crm-automations.py weekly-report" \
    --description "Weekly CRM activity report"

# Full automation check (Daily at 6:00 AM)
echo "Setting up comprehensive daily automation..."
openclaw cron create \
    --name "crm_daily_full_automation" \
    --schedule "0 6 * * *" \
    --command "cd $(pwd) && python3 crm-automations.py full-automation" \
    --description "Comprehensive daily CRM automation"

echo ""
echo "✅ CRM automation tasks created successfully!"

# Test the system
echo ""
echo "🧪 Testing CRM system..."

# Test data loading
if python3 -c "
import json
try:
    with open('filtered_crm_data.json', 'r') as f:
        data = json.load(f)
    print('✅ CRM data loads successfully')
    print(f'📊 Found {len(data[\"filtered_prospects\"])} prospects')
except Exception as e:
    print(f'❌ Error loading data: {e}')
    exit(1)
"; then
    echo "✅ Data validation passed"
else
    echo "❌ Data validation failed"
    exit 1
fi

# Test automation script
if python3 crm-automations.py > /dev/null 2>&1; then
    echo "✅ Automation script is working"
else
    echo "❌ Automation script has issues"
fi

echo ""
echo "🎉 SaniCrete CRM System Setup Complete!"
echo ""
echo "NEXT STEPS:"
echo "==========="
echo ""
echo "1. 🌐 Start the CRM system:"
echo "   ./start-crm.sh"
echo ""
echo "2. 📱 Access your CRM dashboard:"
echo "   http://localhost:8000/crm-system.html"
echo ""
echo "3. 🤖 Automation Schedule:"
echo "   • Daily at 6:00 AM - Full automation check"
echo "   • Daily at 9:00 AM - Overdue follow-up alerts"
echo "   • Daily at 10:00 AM & 3:00 PM - Lead score updates"
echo "   • Monday at 8:00 AM - Pipeline automation"
echo "   • Friday at 5:00 PM - Weekly report"
echo ""
echo "4. 📋 Manual Commands:"
echo "   • Check overdue: python3 crm-automations.py check-overdue"
echo "   • Update scores: python3 crm-automations.py update-scores"
echo "   • Generate report: python3 crm-automations.py weekly-report"
echo ""
echo "5. 💾 Your Data:"
echo "   • Prospect data: filtered_crm_data.json"
echo "   • User customizations: user_data/ directory"
echo "   • All changes are saved locally and persist between sessions"
echo ""
echo "🔧 System Features:"
echo "   ✅ Interactive prospect management"
echo "   ✅ Automated follow-up reminders" 
echo "   ✅ Lead scoring and pipeline automation"
echo "   ✅ Email template generation"
echo "   ✅ OpenClaw integration for notifications"
echo "   ✅ Export capabilities for external tools"
echo ""
echo "Happy CRM management! 🚀"
echo ""