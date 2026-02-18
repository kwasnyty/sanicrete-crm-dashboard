import { Company, FilterCriteria, Email, FollowUp, AutomationRule } from '@/types/crm';
import { v4 as uuidv4 } from 'uuid';

// Smart filtering functions
export const applyFilters = (companies: Company[], filters: FilterCriteria): Company[] => {
  return companies.filter(company => {
    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(company.category)) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(company.status)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(company.priority)) return false;
    }

    // Score range filter
    if (filters.minScore && company.overallScore < filters.minScore) return false;
    if (filters.maxScore && company.overallScore > filters.maxScore) return false;

    // Recent activity filter
    if (filters.hasRecentActivity) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const lastActivity = new Date(company.latestContact);
      if (lastActivity < thirtyDaysAgo) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const companyDate = new Date(company.latestContact);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (companyDate < startDate || companyDate > endDate) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => company.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        company.name,
        company.notes,
        ...company.contacts.map(c => `${c.firstName} ${c.lastName} ${c.email}`),
        ...company.emails.map(e => e.subject),
        ...company.tags
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    return true;
  });
};

// Email content analysis for smart filtering
export const analyzeEmailContent = (subject: string, content?: string): {
  isBusinessRelevant: boolean;
  keywords: string[];
  type: Email['type'];
  score: number;
} => {
  const businessKeywords = [
    'flooring', 'concrete', 'epoxy', 'construction', 'bid', 'quote', 
    'facility', 'industrial', 'project', 'specification', 'proposal',
    'coating', 'floor', 'surface', 'installation', 'renovation',
    'food processing', 'manufacturing', 'warehouse', 'production',
    'safety', 'hygiene', 'chemical resistance', 'durability'
  ];

  const exclusionPatterns = [
    'newsletter', 'promotion', 'marketing', 'unsubscribe', 'promo',
    'bass pro', 'google', 'notification', 'noreply', 'no-reply',
    'automated', 'system message', 'do not reply', 'marketing@',
    'news@', 'info@', 'support@', 'help@'
  ];

  const text = `${subject} ${content || ''}`.toLowerCase();
  
  // Check exclusion patterns
  const hasExclusionPattern = exclusionPatterns.some(pattern => 
    text.includes(pattern.toLowerCase())
  );
  
  if (hasExclusionPattern) {
    return {
      isBusinessRelevant: false,
      keywords: [],
      type: 'general',
      score: 0
    };
  }

  // Find business keywords
  const foundKeywords = businessKeywords.filter(keyword => 
    text.includes(keyword.toLowerCase())
  );

  // Determine email type
  let type: Email['type'] = 'general';
  if (text.includes('quote') || text.includes('proposal') || text.includes('bid')) {
    type = 'quote';
  } else if (text.includes('follow up') || text.includes('follow-up')) {
    type = 'follow_up';
  } else if (text.includes('project') || text.includes('installation')) {
    type = 'project';
  } else if (foundKeywords.length > 0) {
    type = 'business';
  }

  // Calculate relevance score
  const score = foundKeywords.length * 10 + (type !== 'general' ? 20 : 0);

  return {
    isBusinessRelevant: foundKeywords.length > 0 || type !== 'general',
    keywords: foundKeywords,
    type,
    score
  };
};

// Follow-up scheduling
export const scheduleFollowUp = (
  companyId: string,
  type: FollowUp['type'],
  description: string,
  customDate?: string
): FollowUp => {
  const now = new Date();
  let dueDate = new Date();

  switch (type) {
    case '1_week':
      dueDate.setDate(now.getDate() + 7);
      break;
    case '2_weeks':
      dueDate.setDate(now.getDate() + 14);
      break;
    case '1_month':
      dueDate.setMonth(now.getMonth() + 1);
      break;
    case 'custom':
      if (customDate) {
        dueDate = new Date(customDate);
      }
      break;
  }

  return {
    id: uuidv4(),
    dueDate: dueDate.toISOString(),
    type,
    description,
    completed: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
};

// OpenClaw integration functions
export const createOpenClawCronJob = async (followUp: FollowUp, companyName: string) => {
  const cronExpression = convertDateToCron(new Date(followUp.dueDate));
  
  const cronData = {
    schedule: cronExpression,
    command: 'crm-followup-reminder',
    data: {
      followUpId: followUp.id,
      companyName,
      description: followUp.description,
      type: followUp.type
    }
  };

  // In a static deployment, log the cron job for external processing
  console.log('🚀 OpenClaw Cron Job Request:', cronData);
  
  // For static deployment, simulate successful creation
  const cronJobId = `crm_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In a real implementation with a backend, you would:
  // 1. Store this request in a queue/database
  // 2. Process via webhook or batch job
  // 3. Send to OpenClaw API when backend is available
  
  localStorage.setItem(`cron_job_${cronJobId}`, JSON.stringify({
    ...cronData,
    cronJobId,
    created: new Date().toISOString(),
    status: 'pending'
  }));
  
  return cronJobId;
};

// Convert date to cron expression
export const convertDateToCron = (date: Date): string => {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return `${minute} ${hour} ${day} ${month} * ${year}`;
};

// Pipeline management
export const moveToPipelineStage = (
  company: Company, 
  newStatus: Company['status'],
  automationRules: AutomationRule[] = []
): Company => {
  const updatedCompany = {
    ...company,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  // Trigger automation rules
  const statusChangeRules = automationRules.filter(rule => 
    rule.trigger.type === 'status_change' && rule.isActive
  );

  statusChangeRules.forEach(rule => {
    if (rule.trigger.conditions.from === company.status && 
        rule.trigger.conditions.to === newStatus) {
      // Execute automation actions
      rule.actions.forEach(action => {
        executeAutomationAction(action, updatedCompany);
      });
    }
  });

  return updatedCompany;
};

// Automation action executor
export const executeAutomationAction = (action: AutomationRule['actions'][0], company: Company) => {
  switch (action.type) {
    case 'create_follow_up':
      const followUp = scheduleFollowUp(
        company.id,
        action.data.type || '1_week',
        action.data.description || `Automated follow-up for ${company.name}`
      );
      company.followUps.push(followUp);
      break;
      
    case 'update_score':
      company.overallScore += action.data.scoreChange || 0;
      break;
      
    case 'update_status':
      company.status = action.data.newStatus;
      break;
      
    case 'send_notification':
      // This would send a notification via OpenClaw
      sendNotification(action.data.message, company);
      break;
  }
};

// Notification system
export const sendNotification = async (message: string, company?: Company) => {
  const notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'crm_alert',
    message,
    companyId: company?.id,
    companyName: company?.name,
    timestamp: new Date().toISOString(),
    read: false
  };

  console.log('🔔 CRM Notification:', notification);
  
  // Store notification locally for static deployment
  const existingNotifications = JSON.parse(localStorage.getItem('crm_notifications') || '[]');
  existingNotifications.unshift(notification);
  
  // Keep only the latest 50 notifications
  if (existingNotifications.length > 50) {
    existingNotifications.splice(50);
  }
  
  localStorage.setItem('crm_notifications', JSON.stringify(existingNotifications));

  // In a real implementation with backend, you would:
  // 1. Send to notification service (email, Slack, etc.)
  // 2. Store in database for notification history
  // 3. Send to OpenClaw for display in main interface
  // 4. Trigger webhook to external systems
};

// Lead scoring
export const calculateLeadScore = (company: Company): number => {
  let score = 0;
  
  // Email activity score
  score += company.totalEmails * 2;
  
  // Conversation quality score
  score += company.conversationScore * 3;
  
  // Business relevance score
  score += company.businessScore * 5;
  
  // Recent activity bonus
  const daysSinceLastContact = Math.floor(
    (Date.now() - new Date(company.latestContact).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceLastContact < 7) score += 20;
  else if (daysSinceLastContact < 30) score += 10;
  
  // Industry bonus
  if (['Food Processing', 'Industrial/Manufacturing', 'Construction'].includes(company.category)) {
    score += 15;
  }
  
  // Follow-up completion rate
  const completedFollowUps = company.followUps.filter(f => f.completed).length;
  const totalFollowUps = company.followUps.length;
  if (totalFollowUps > 0) {
    score += (completedFollowUps / totalFollowUps) * 10;
  }
  
  return Math.round(score);
};

// Data export functions
export const exportToCSV = (companies: Company[]): string => {
  const headers = [
    'Company Name', 'Category', 'Status', 'Priority', 'Score', 
    'Total Emails', 'First Contact', 'Latest Contact', 'Primary Contact',
    'Email', 'Phone', 'Notes'
  ];
  
  const rows = companies.map(company => {
    const primaryContact = company.contacts.find(c => c.isPrimary) || company.contacts[0];
    return [
      company.name,
      company.category,
      company.status,
      company.priority,
      company.overallScore,
      company.totalEmails,
      company.firstContact,
      company.latestContact,
      primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : '',
      primaryContact?.email || '',
      primaryContact?.phone || '',
      company.notes.replace(/\n/g, ' ').replace(/"/g, '""')
    ].map(field => `"${field}"`).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

// Data validation
export const validateCompanyData = (company: Partial<Company>): string[] => {
  const errors: string[] = [];
  
  if (!company.name || company.name.trim().length === 0) {
    errors.push('Company name is required');
  }
  
  if (!company.category) {
    errors.push('Company category is required');
  }
  
  if (!company.status) {
    errors.push('Company status is required');
  }
  
  if (!company.priority) {
    errors.push('Company priority is required');
  }
  
  if (company.contacts && company.contacts.length === 0) {
    errors.push('At least one contact is required');
  }
  
  return errors;
};