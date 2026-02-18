# 🔗 OpenClaw Integration Guide

This document explains how to integrate the SaniCrete CRM system with Tyler's existing OpenClaw setup for full automation capabilities.

## 🚀 Integration Overview

The CRM system is designed to work seamlessly with OpenClaw's cron system and notification framework. Here's what gets automated:

### 📅 Automatic Cron Jobs
- **Follow-up reminders** scheduled in OpenClaw when you click "Schedule Follow-up"
- **Pipeline alerts** when companies move between stages
- **Overdue task notifications** for missed follow-ups
- **High-score lead alerts** when prospects exceed thresholds

### 🔔 Notification System
- **Real-time alerts** sent to Tyler's main OpenClaw interface
- **Email notifications** for critical CRM events
- **Slack/Discord webhooks** for team coordination
- **Mobile notifications** for urgent follow-ups

## 🛠️ Setup Instructions

### Step 1: Configure CRM Settings

1. **Open the CRM system** at your GitHub Pages URL
2. **Navigate to Settings** → **Integration tab**
3. **Configure the following URLs**:

```
OpenClaw Webhook URL: https://your-openclaw-instance.com/webhook
Cron Job Endpoint:   https://your-openclaw-instance.com/api/cron
```

4. **Enable Automation** checkbox ✅

### Step 2: OpenClaw Webhook Handler

Add this webhook handler to your OpenClaw instance:

```python
# openclaw_crm_webhook.py
from openclaw import cron, notify

@webhook('/webhook/crm')
def handle_crm_webhook(request):
    data = request.json()
    
    if data['type'] == 'follow_up_scheduled':
        # Create cron job for follow-up reminder
        schedule = data['schedule']  # e.g., "0 9 * * 1" (Monday 9 AM)
        company = data['company']
        
        cron.create_job(
            name=f"CRM Follow-up: {company}",
            schedule=schedule,
            command=f"notify 'Follow up with {company}' --channel=crm",
            source="sanicrete-crm"
        )
    
    elif data['type'] == 'high_score_lead':
        # Send immediate notification
        notify.send(
            message=f"🔥 High-value lead: {data['company']} (Score: {data['score']})",
            channel="crm-alerts",
            priority="high"
        )
    
    elif data['type'] == 'pipeline_change':
        # Log pipeline movement
        notify.send(
            message=f"📈 {data['company']} moved to {data['new_status']}",
            channel="crm-updates"
        )
    
    return {"status": "success"}
```

### Step 3: Cron Command Registration

Register CRM commands in your OpenClaw cron system:

```python
# crm_commands.py
@cron_command('crm-followup-reminder')
def followup_reminder(company_name, description, followup_type):
    message = f"""
🏗️ SaniCrete CRM Reminder
Company: {company_name}
Task: {description}
Type: {followup_type}
    
View in CRM: https://your-github-pages-url.github.io/sanicrete-crm-dashboard/
    """
    
    notify.send(message, channel="crm-reminders", priority="normal")
    
    # Optionally send email
    if followup_type == "1_week":
        send_email(
            to="tyler@sanicrete.com",
            subject=f"CRM: Follow up with {company_name}",
            body=message
        )

@cron_command('crm-pipeline-alert') 
def pipeline_alert(company_name, old_status, new_status):
    message = f"Pipeline Update: {company_name} moved from {old_status} to {new_status}"
    notify.send(message, channel="crm-pipeline")

@cron_command('crm-overdue-check')
def check_overdue_tasks():
    # This could query the CRM data to find overdue tasks
    # For now, it's handled by the frontend
    notify.send("Checking for overdue CRM tasks...", channel="crm-system")
```

### Step 4: Data Synchronization (Optional)

For two-way sync between CRM and OpenClaw:

```python
# crm_sync.py
import json
import requests

def sync_crm_data():
    """Sync CRM data with OpenClaw storage"""
    
    # Get CRM data from GitHub Pages
    crm_url = "https://your-github-pages.github.io/sanicrete-crm-dashboard/crm-data.json"
    response = requests.get(crm_url)
    crm_data = response.json()
    
    # Process and store in OpenClaw
    for company_id, company_data in crm_data.get('companies', {}).items():
        # Update OpenClaw contact database
        update_contact_record(company_id, company_data)
        
        # Create follow-up cron jobs for pending tasks
        for followup in company_data.get('followUps', []):
            if not followup.get('completed') and not followup.get('cronJobId'):
                create_followup_job(company_data['name'], followup)

# Run sync every hour
@cron.schedule("0 * * * *")
def hourly_crm_sync():
    sync_crm_data()
```

## 🔧 Configuration Examples

### Environment Variables
Set these in your OpenClaw environment:

```bash
# .env file
CRM_WEBHOOK_SECRET=your_webhook_secret_key
CRM_NOTIFICATION_CHANNEL=crm-alerts
CRM_EMAIL_NOTIFICATIONS=true
ADMIN_EMAIL=tyler@sanicrete.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Notification Channels
Configure different channels for different types of alerts:

```python
NOTIFICATION_CHANNELS = {
    'crm-alerts': {
        'high_score_leads': True,
        'pipeline_changes': True,
        'overdue_tasks': True
    },
    'crm-reminders': {
        'follow_ups': True,
        'scheduled_calls': True
    },
    'crm-system': {
        'data_sync': True,
        'errors': True
    }
}
```

## 📊 Automated Workflows

### New Lead Detected
```
CRM detects high-score lead (1000+)
    ↓
Sends webhook to OpenClaw
    ↓
OpenClaw creates notification
    ↓
Alert sent to Tyler's dashboard + email
```

### Follow-up Scheduled
```
User clicks "Schedule Follow-up" in CRM
    ↓
CRM calculates due date and cron expression
    ↓
Sends cron job request to OpenClaw
    ↓
OpenClaw schedules reminder
    ↓
At due time: notification sent with link back to CRM
```

### Pipeline Movement
```
Company dragged from "Lead" to "Qualified"
    ↓
CRM triggers automation rules
    ↓
Webhook sent to OpenClaw with status change
    ↓
OpenClaw logs activity + sends team notification
    ↓
Optional: Auto-schedule next follow-up
```

## 🚨 Error Handling

### Webhook Failures
```python
@webhook('/webhook/crm')
def handle_crm_webhook(request):
    try:
        # Process webhook
        return {"status": "success"}
    except Exception as e:
        # Log error
        log.error(f"CRM webhook failed: {e}")
        
        # Send error notification
        notify.send(
            f"CRM webhook error: {str(e)}",
            channel="system-errors", 
            priority="high"
        )
        
        return {"status": "error", "message": str(e)}, 500
```

### Cron Job Failures
```python
@cron_command('crm-followup-reminder')
def followup_reminder(**kwargs):
    try:
        # Execute reminder
        pass
    except Exception as e:
        # Retry mechanism
        retry_count = kwargs.get('retry_count', 0)
        if retry_count < 3:
            # Schedule retry in 1 hour
            cron.create_job(
                name=f"CRM Retry: {kwargs['company_name']}",
                schedule="0 * * * *",  # Next hour
                command="crm-followup-reminder",
                data={**kwargs, 'retry_count': retry_count + 1}
            )
```

## 📈 Monitoring & Analytics

### CRM Usage Metrics
Track CRM system usage in OpenClaw:

```python
@webhook('/webhook/crm-analytics')
def track_crm_usage(request):
    data = request.json()
    
    metrics = {
        'companies_viewed': data.get('companies_viewed', 0),
        'pipeline_movements': data.get('pipeline_movements', 0),
        'follow_ups_scheduled': data.get('follow_ups_scheduled', 0),
        'bulk_operations': data.get('bulk_operations', 0)
    }
    
    # Store in OpenClaw metrics system
    store_metrics('crm_usage', metrics, timestamp=data['timestamp'])
```

### Performance Monitoring
```python
@cron.schedule("0 0 * * *")  # Daily at midnight
def crm_health_check():
    # Check if CRM is accessible
    try:
        response = requests.get("https://your-crm-url.github.io/sanicrete-crm-dashboard/")
        if response.status_code == 200:
            notify.send("✅ CRM system healthy", channel="system-health")
        else:
            notify.send(f"⚠️ CRM system issue: HTTP {response.status_code}", channel="system-errors")
    except Exception as e:
        notify.send(f"❌ CRM system unreachable: {e}", channel="system-errors", priority="high")
```

## 🔐 Security Considerations

### Webhook Authentication
```python
import hmac
import hashlib

def verify_webhook_signature(request):
    signature = request.headers.get('X-CRM-Signature')
    payload = request.get_data()
    secret = os.getenv('CRM_WEBHOOK_SECRET')
    
    expected_signature = hmac.new(
        secret.encode(), 
        payload, 
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

@webhook('/webhook/crm')
def handle_crm_webhook(request):
    if not verify_webhook_signature(request):
        return {"error": "Invalid signature"}, 401
    
    # Process webhook...
```

### Rate Limiting
```python
from collections import defaultdict
import time

# Simple rate limiting
webhook_calls = defaultdict(list)

@webhook('/webhook/crm')
def handle_crm_webhook(request):
    client_ip = request.remote_addr
    now = time.time()
    
    # Clean old entries
    webhook_calls[client_ip] = [
        t for t in webhook_calls[client_ip] 
        if now - t < 3600  # Last hour
    ]
    
    # Check rate limit (100 per hour)
    if len(webhook_calls[client_ip]) >= 100:
        return {"error": "Rate limit exceeded"}, 429
    
    webhook_calls[client_ip].append(now)
    
    # Process webhook...
```

## 🎯 Next Steps

1. **Test the integration** with a few manual follow-up scheduling
2. **Monitor OpenClaw logs** for webhook calls and cron job creation  
3. **Set up notification channels** (email, Slack, etc.)
4. **Configure data backup** for CRM data persistence
5. **Scale gradually** by enabling more automation rules

## 📞 Support

For integration issues:
- Check OpenClaw logs for webhook errors
- Verify CRM settings in the Settings panel
- Test webhook endpoints manually with curl/Postman
- Monitor cron job execution in OpenClaw admin panel

---

**Integration completed successfully = Full automated CRM workflow! 🚀**