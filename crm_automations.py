#!/usr/bin/env python3
"""
SaniCrete CRM Automations
Integration with OpenClaw cron system for follow-up reminders and pipeline automation
"""

import json
import os
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

class CRMAutomations:
    def __init__(self, workspace_dir=None):
        self.workspace_dir = workspace_dir or "/Users/sanicreteassistant/.openclaw/workspace/sanicrete-crm-dashboard"
        self.data_file = os.path.join(self.workspace_dir, "filtered_crm_data.json")
        self.user_data_dir = os.path.join(self.workspace_dir, "user_data")
        
        # Create user data directory if it doesn't exist
        os.makedirs(self.user_data_dir, exist_ok=True)
    
    def load_crm_data(self):
        """Load CRM prospect data"""
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
            return data['filtered_prospects']
        except Exception as e:
            print(f"Error loading CRM data: {e}")
            return {}
    
    def get_user_data(self, company_name):
        """Load user-specific data for a company"""
        user_file = os.path.join(self.user_data_dir, f"{company_name}.json")
        try:
            if os.path.exists(user_file):
                with open(user_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading user data for {company_name}: {e}")
        return {}
    
    def save_user_data(self, company_name, data):
        """Save user-specific data for a company"""
        user_file = os.path.join(self.user_data_dir, f"{company_name}.json")
        try:
            with open(user_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving user data for {company_name}: {e}")
    
    def create_followup_reminder(self, company_name, followup_data):
        """Create OpenClaw cron reminder for follow-up"""
        try:
            followup_date = datetime.fromisoformat(followup_data['datetime'].replace('Z', '+00:00'))
            
            # Create cron schedule (minute hour day month weekday)
            cron_schedule = f"{followup_date.minute} {followup_date.hour} {followup_date.day} {followup_date.month} *"
            
            # Create reminder message
            message = f"""🔔 CRM FOLLOW-UP REMINDER
            
Company: {company_name}
Type: {followup_data['type'].replace('_', ' ').title()}
Notes: {followup_data.get('notes', 'No notes provided')}
Scheduled: {followup_date.strftime('%B %d, %Y at %I:%M %p')}

Action Items:
• Review prospect history
• Prepare talking points
• Check for recent activity
• Update CRM after contact
"""
            
            # Create OpenClaw cron job
            cron_name = f"crm_followup_{company_name}_{followup_data['id']}"
            
            # Command to send reminder
            command = [
                "openclaw", "cron", "create",
                "--name", cron_name,
                "--schedule", cron_schedule,
                "--command", f"openclaw message send --target='Tyler' --message='{message}'"
            ]
            
            result = subprocess.run(command, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ Created follow-up reminder for {company_name}")
                return True
            else:
                print(f"❌ Failed to create reminder: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"Error creating follow-up reminder: {e}")
            return False
    
    def check_overdue_followups(self):
        """Check for overdue follow-ups and send alerts"""
        prospects = self.load_crm_data()
        overdue_count = 0
        overdue_companies = []
        
        for company_name in prospects.keys():
            user_data = self.get_user_data(company_name)
            next_followup = user_data.get('next_followup')
            
            if next_followup:
                followup_date = datetime.fromisoformat(next_followup.replace('Z', '+00:00'))
                if datetime.now() > followup_date:
                    overdue_count += 1
                    overdue_companies.append({
                        'company': company_name,
                        'due_date': followup_date,
                        'days_overdue': (datetime.now() - followup_date).days
                    })
        
        if overdue_companies:
            # Send overdue alert
            message = f"🚨 CRM OVERDUE ALERT - {overdue_count} Follow-ups Past Due\\n\\n"
            
            for company in sorted(overdue_companies, key=lambda x: x['days_overdue'], reverse=True):
                message += f"• {company['company']} - {company['days_overdue']} days overdue\\n"
            
            message += "\\nRecommended Actions:\\n"
            message += "• Review and contact overdue prospects\\n"
            message += "• Update CRM status after contact\\n"
            message += "• Reschedule follow-ups as needed"
            
            # Send alert via OpenClaw
            subprocess.run([
                "openclaw", "message", "send",
                "--target", "Tyler", 
                "--message", message
            ])
            
            print(f"📨 Sent overdue alert for {overdue_count} companies")
        
        return overdue_companies
    
    def auto_score_update(self):
        """Automatically update lead scores based on activity"""
        prospects = self.load_crm_data()
        updates = 0
        
        for company_name, prospect in prospects.items():
            user_data = self.get_user_data(company_name)
            current_score = user_data.get('custom_score', prospect.get('overall_score', 0))
            
            new_score = self.calculate_auto_score(prospect, user_data)
            
            if abs(new_score - current_score) >= 10:  # Only update if significant change
                user_data['custom_score'] = new_score
                user_data['score_updated'] = datetime.now().isoformat()
                self.save_user_data(company_name, user_data)
                updates += 1
                
                print(f"📊 Updated score for {company_name}: {current_score} → {new_score}")
        
        if updates > 0:
            print(f"✅ Updated scores for {updates} prospects")
        
        return updates
    
    def calculate_auto_score(self, prospect, user_data):
        """Calculate automated lead score based on various factors"""
        score = prospect.get('overall_score', 0)
        
        # Recent activity bonus
        if prospect.get('latest_contact'):
            try:
                last_contact = datetime.fromisoformat(prospect['latest_contact'].replace('Z', '+00:00'))
                days_since = (datetime.now() - last_contact).days
                
                if days_since < 7:
                    score += 50
                elif days_since < 30:
                    score += 25
                elif days_since < 90:
                    score += 10
            except:
                pass
        
        # Status bonus
        status_bonus = {
            'hot': 100,
            'warm': 50,
            'new': 25,
            'cold': 0
        }
        score += status_bonus.get(user_data.get('status', 'cold'), 0)
        
        # Priority tags bonus
        priority_tags = user_data.get('priority_tags', [])
        score += len(priority_tags) * 15
        
        # Business context bonus
        business_score = prospect.get('business_score', 0)
        conversation_score = prospect.get('conversation_score', 0)
        
        if business_score > 10:
            score += 30
        if conversation_score > 5:
            score += 20
        
        # Industry relevance bonus
        high_value_categories = ['Food Processing', 'Construction', 'Industrial/Manufacturing']
        if prospect.get('category') in high_value_categories:
            score += 25
        
        return min(score, 500)  # Cap at 500
    
    def pipeline_automation(self):
        """Automated pipeline stage management"""
        prospects = self.load_crm_data()
        pipeline_updates = 0
        
        for company_name, prospect in prospects.items():
            user_data = self.get_user_data(company_name)
            current_status = user_data.get('status', 'new')
            
            # Auto-promote based on activity
            new_status = self.suggest_status_update(prospect, user_data)
            
            if new_status and new_status != current_status:
                user_data['status'] = new_status
                user_data['status_auto_updated'] = datetime.now().isoformat()
                user_data['previous_status'] = current_status
                self.save_user_data(company_name, user_data)
                pipeline_updates += 1
                
                print(f"📈 Pipeline update for {company_name}: {current_status} → {new_status}")
        
        return pipeline_updates
    
    def suggest_status_update(self, prospect, user_data):
        """Suggest status updates based on activity patterns"""
        current_status = user_data.get('status', 'new')
        business_score = prospect.get('business_score', 0)
        conversation_score = prospect.get('conversation_score', 0)
        
        # High activity = move to warm
        if (business_score > 20 or conversation_score > 10) and current_status == 'new':
            return 'warm'
        
        # Very high activity = move to hot
        if (business_score > 50 or conversation_score > 20) and current_status in ['new', 'warm']:
            return 'hot'
        
        # Recent contact activity
        if user_data.get('last_contacted'):
            try:
                last_contact = datetime.fromisoformat(user_data['last_contacted'])
                days_since = (datetime.now() - last_contact).days
                
                if days_since <= 7 and current_status == 'cold':
                    return 'warm'
            except:
                pass
        
        return None
    
    def generate_weekly_report(self):
        """Generate weekly CRM activity report"""
        prospects = self.load_crm_data()
        
        # Calculate metrics
        total_prospects = len(prospects)
        hot_leads = 0
        overdue_followups = 0
        new_this_week = 0
        
        category_breakdown = {}
        
        for company_name, prospect in prospects.items():
            user_data = self.get_user_data(company_name)
            
            # Count by status
            if user_data.get('status') == 'hot':
                hot_leads += 1
            
            # Count overdue
            if user_data.get('next_followup'):
                try:
                    followup_date = datetime.fromisoformat(user_data['next_followup'].replace('Z', '+00:00'))
                    if datetime.now() > followup_date:
                        overdue_followups += 1
                except:
                    pass
            
            # Count new prospects
            if user_data.get('status') == 'new':
                new_this_week += 1
            
            # Category breakdown
            category = prospect.get('category', 'Unknown')
            category_breakdown[category] = category_breakdown.get(category, 0) + 1
        
        # Generate report
        report = f"""📊 SaniCrete CRM Weekly Report
Generated: {datetime.now().strftime('%B %d, %Y')}

OVERVIEW:
• Total Prospects: {total_prospects}
• Hot Leads: {hot_leads}
• New Prospects: {new_this_week}
• Overdue Follow-ups: {overdue_followups}

CATEGORY BREAKDOWN:"""
        
        for category, count in sorted(category_breakdown.items(), key=lambda x: x[1], reverse=True):
            report += f"\\n• {category}: {count}"
        
        report += f"""

RECOMMENDED ACTIONS:
• Contact {overdue_followups} overdue prospects
• Follow up with {hot_leads} hot leads
• Review and qualify {new_this_week} new prospects
• Schedule site visits for qualified opportunities

Access your CRM: http://localhost:8000/crm-system.html"""
        
        # Send report
        subprocess.run([
            "openclaw", "message", "send",
            "--target", "Tyler",
            "--message", report
        ])
        
        print("📨 Weekly report sent!")
        return report

def main():
    """Main automation function - can be called by cron"""
    import sys
    
    crm = CRMAutomations()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "check-overdue":
            crm.check_overdue_followups()
        elif command == "update-scores":
            crm.auto_score_update()
        elif command == "pipeline-automation":
            crm.pipeline_automation()
        elif command == "weekly-report":
            crm.generate_weekly_report()
        elif command == "full-automation":
            print("🤖 Running full CRM automation...")
            crm.check_overdue_followups()
            crm.auto_score_update()
            crm.pipeline_automation()
            print("✅ Full automation complete!")
        else:
            print(f"Unknown command: {command}")
            print("Available commands: check-overdue, update-scores, pipeline-automation, weekly-report, full-automation")
    else:
        print("🤖 SaniCrete CRM Automations")
        print("Usage: python3 crm-automations.py <command>")
        print("Commands:")
        print("  check-overdue     - Check for overdue follow-ups")
        print("  update-scores     - Update lead scores automatically")
        print("  pipeline-automation - Automated pipeline management")
        print("  weekly-report     - Generate weekly activity report")
        print("  full-automation   - Run all automations")

if __name__ == "__main__":
    main()