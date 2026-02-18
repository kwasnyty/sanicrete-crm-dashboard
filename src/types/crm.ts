export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

export interface Email {
  id: string;
  date: string;
  subject: string;
  type: 'business' | 'follow_up' | 'quote' | 'project' | 'general';
  keywords: string[];
  snippet?: string;
  direction: 'incoming' | 'outgoing';
  hasAttachments: boolean;
}

export interface FollowUp {
  id: string;
  dueDate: string;
  type: '1_week' | '2_weeks' | '1_month' | 'custom';
  description: string;
  completed: boolean;
  cronJobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  number: string;
  amount: number;
  description: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdDate: string;
  validUntil?: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Company {
  id: string;
  name: string;
  category: 'Business Prospect' | 'Service Provider' | 'Construction' | 'Food Processing' | 'Industrial/Manufacturing';
  status: 'Lead' | 'Qualified' | 'Quoted' | 'Won' | 'Lost';
  priority: 'Hot' | 'Warm' | 'Cold';
  
  // Contact Information
  contacts: Contact[];
  website?: string;
  industry?: string;
  address?: string;
  
  // Business Metrics
  totalEmails: number;
  businessScore: number;
  conversationScore: number;
  overallScore: number;
  
  // Timeline
  firstContact: string;
  latestContact: string;
  lastActivity?: string;
  
  // CRM Data
  notes: string;
  emails: Email[];
  followUps: FollowUp[];
  quotes: Quote[];
  tags: string[];
  
  // System Fields
  createdAt: string;
  updatedAt: string;
  
  // Custom Fields
  customFields: Record<string, any>;
}

export interface CrmData {
  companies: Company[];
  statistics: {
    totalProspects: number;
    activeProspects: number;
    totalEmails: number;
    conversionRate: number;
    pipelineValue: number;
  };
  lastUpdated: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  companies: Company[];
  color: string;
  order: number;
}

export interface FilterCriteria {
  category?: string[];
  status?: string[];
  priority?: string[];
  industry?: string[];
  minScore?: number;
  maxScore?: number;
  hasRecentActivity?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  searchQuery?: string;
}

export interface BulkOperation {
  action: 'updateStatus' | 'updatePriority' | 'addTag' | 'scheduleFollowUp' | 'delete';
  companyIds: string[];
  data: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'follow_up' | 'introduction' | 'quote_follow_up' | 'project_update';
  variables: string[];
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'email_received' | 'status_change' | 'time_based' | 'score_change';
    conditions: Record<string, any>;
  };
  actions: {
    type: 'create_follow_up' | 'update_score' | 'send_notification' | 'update_status';
    data: Record<string, any>;
  }[];
  isActive: boolean;
  lastTriggered?: string;
}

export interface CrmSettings {
  autoFollowUpRules: {
    newLead: number; // days
    afterQuote: number; // days
    coldProspect: number; // days
  };
  emailFilters: {
    excludePatterns: string[];
    businessKeywords: string[];
    industrialTerms: string[];
  };
  notifications: {
    overdueFollowUps: boolean;
    newHighScoreProspects: boolean;
    pipelineChanges: boolean;
  };
  integration: {
    openclawWebhookUrl?: string;
    cronEndpoint?: string;
    enableAutomation: boolean;
  };
}