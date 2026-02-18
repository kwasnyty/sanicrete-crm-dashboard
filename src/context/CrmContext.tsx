'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Company, FilterCriteria, BulkOperation, FollowUp, AutomationRule, CrmSettings } from '@/types/crm';
import { applyFilters, calculateLeadScore, moveToPipelineStage, scheduleFollowUp, createOpenClawCronJob } from '@/lib/crm-utils';
import { v4 as uuidv4 } from 'uuid';

interface CrmState {
  companies: Company[];
  filteredCompanies: Company[];
  selectedCompanies: string[];
  filters: FilterCriteria;
  isLoading: boolean;
  error: string | null;
  automationRules: AutomationRule[];
  settings: CrmSettings;
  lastUpdated: string;
}

type CrmAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_COMPANIES'; payload: Company[] }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'DELETE_COMPANY'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterCriteria }
  | { type: 'SET_SELECTED_COMPANIES'; payload: string[] }
  | { type: 'TOGGLE_COMPANY_SELECTION'; payload: string }
  | { type: 'BULK_OPERATION'; payload: BulkOperation }
  | { type: 'ADD_FOLLOW_UP'; payload: { companyId: string; followUp: FollowUp } }
  | { type: 'UPDATE_FOLLOW_UP'; payload: { companyId: string; followUp: FollowUp } }
  | { type: 'SET_AUTOMATION_RULES'; payload: AutomationRule[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<CrmSettings> }
  | { type: 'REFRESH_SCORES' };

const initialState: CrmState = {
  companies: [],
  filteredCompanies: [],
  selectedCompanies: [],
  filters: {},
  isLoading: false,
  error: null,
  automationRules: [],
  settings: {
    autoFollowUpRules: {
      newLead: 7,
      afterQuote: 14,
      coldProspect: 30
    },
    emailFilters: {
      excludePatterns: ['newsletter', 'promotion', 'marketing', 'unsubscribe', 'bass pro', 'google'],
      businessKeywords: ['flooring', 'concrete', 'epoxy', 'construction', 'bid', 'quote', 'facility'],
      industrialTerms: ['food processing', 'manufacturing', 'industrial', 'warehouse', 'production']
    },
    notifications: {
      overdueFollowUps: true,
      newHighScoreProspects: true,
      pipelineChanges: true
    },
    integration: {
      enableAutomation: true
    }
  },
  lastUpdated: new Date().toISOString()
};

const crmReducer = (state: CrmState, action: CrmAction): CrmState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'LOAD_COMPANIES':
      const filteredCompanies = applyFilters(action.payload, state.filters);
      return {
        ...state,
        companies: action.payload,
        filteredCompanies,
        lastUpdated: new Date().toISOString()
      };

    case 'UPDATE_COMPANY':
      const updatedCompanies = state.companies.map(company =>
        company.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : company
      );
      return {
        ...state,
        companies: updatedCompanies,
        filteredCompanies: applyFilters(updatedCompanies, state.filters)
      };

    case 'DELETE_COMPANY':
      const remainingCompanies = state.companies.filter(company => company.id !== action.payload);
      return {
        ...state,
        companies: remainingCompanies,
        filteredCompanies: applyFilters(remainingCompanies, state.filters),
        selectedCompanies: state.selectedCompanies.filter(id => id !== action.payload)
      };

    case 'SET_FILTERS':
      const newFilteredCompanies = applyFilters(state.companies, action.payload);
      return {
        ...state,
        filters: action.payload,
        filteredCompanies: newFilteredCompanies
      };

    case 'SET_SELECTED_COMPANIES':
      return { ...state, selectedCompanies: action.payload };

    case 'TOGGLE_COMPANY_SELECTION':
      const isSelected = state.selectedCompanies.includes(action.payload);
      const newSelection = isSelected
        ? state.selectedCompanies.filter(id => id !== action.payload)
        : [...state.selectedCompanies, action.payload];
      return { ...state, selectedCompanies: newSelection };

    case 'BULK_OPERATION':
      const bulkUpdatedCompanies = state.companies.map(company => {
        if (!action.payload.companyIds.includes(company.id)) return company;

        const updatedCompany = { ...company, updatedAt: new Date().toISOString() };

        switch (action.payload.action) {
          case 'updateStatus':
            updatedCompany.status = action.payload.data.status;
            break;
          case 'updatePriority':
            updatedCompany.priority = action.payload.data.priority;
            break;
          case 'addTag':
            if (!updatedCompany.tags.includes(action.payload.data.tag)) {
              updatedCompany.tags.push(action.payload.data.tag);
            }
            break;
          case 'scheduleFollowUp':
            const followUp = scheduleFollowUp(
              company.id,
              action.payload.data.type,
              action.payload.data.description
            );
            updatedCompany.followUps.push(followUp);
            break;
        }

        return updatedCompany;
      });

      return {
        ...state,
        companies: bulkUpdatedCompanies,
        filteredCompanies: applyFilters(bulkUpdatedCompanies, state.filters),
        selectedCompanies: action.payload.action === 'delete' ? [] : state.selectedCompanies
      };

    case 'ADD_FOLLOW_UP':
      const companiesWithNewFollowUp = state.companies.map(company =>
        company.id === action.payload.companyId
          ? { ...company, followUps: [...company.followUps, action.payload.followUp] }
          : company
      );
      return {
        ...state,
        companies: companiesWithNewFollowUp,
        filteredCompanies: applyFilters(companiesWithNewFollowUp, state.filters)
      };

    case 'UPDATE_FOLLOW_UP':
      const companiesWithUpdatedFollowUp = state.companies.map(company =>
        company.id === action.payload.companyId
          ? {
              ...company,
              followUps: company.followUps.map(followUp =>
                followUp.id === action.payload.followUp.id
                  ? { ...action.payload.followUp, updatedAt: new Date().toISOString() }
                  : followUp
              )
            }
          : company
      );
      return {
        ...state,
        companies: companiesWithUpdatedFollowUp,
        filteredCompanies: applyFilters(companiesWithUpdatedFollowUp, state.filters)
      };

    case 'SET_AUTOMATION_RULES':
      return { ...state, automationRules: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'REFRESH_SCORES':
      const companiesWithUpdatedScores = state.companies.map(company => ({
        ...company,
        overallScore: calculateLeadScore(company)
      }));
      return {
        ...state,
        companies: companiesWithUpdatedScores,
        filteredCompanies: applyFilters(companiesWithUpdatedScores, state.filters)
      };

    default:
      return state;
  }
};

interface CrmContextType extends CrmState {
  // Company management
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
  moveToStage: (companyId: string, newStatus: Company['status']) => void;
  updateCompanyNotes: (companyId: string, notes: string) => void;
  updateCompanyPriority: (companyId: string, priority: Company['priority']) => void;
  
  // Filtering and selection
  setFilters: (filters: FilterCriteria) => void;
  clearFilters: () => void;
  selectCompany: (id: string) => void;
  selectAllCompanies: () => void;
  clearSelection: () => void;
  
  // Bulk operations
  performBulkOperation: (operation: BulkOperation) => void;
  
  // Follow-ups
  addFollowUp: (companyId: string, type: FollowUp['type'], description: string, customDate?: string) => Promise<void>;
  completeFollowUp: (companyId: string, followUpId: string) => void;
  
  // Data operations
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  exportData: (format: 'csv' | 'json') => void;
  
  // Automation
  updateSettings: (settings: Partial<CrmSettings>) => void;
  refreshScores: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};

interface CrmProviderProps {
  children: ReactNode;
}

export const CrmProvider: React.FC<CrmProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/crm-data.json');
      const data = await response.json();
      
      // Convert the historical data format to our Company format
      const companies: Company[] = Object.entries(data.filtered_prospects || {}).map(([key, companyData]: [string, any]) => {
        const primaryContact: any = {
          id: uuidv4(),
          firstName: '',
          lastName: key,
          email: companyData.relevant_emails?.[0]?.from || '',
          isPrimary: true
        };

        return {
          id: uuidv4(),
          name: key,
          category: companyData.category || 'Business Prospect',
          status: 'Lead' as const,
          priority: companyData.overall_score > 1000 ? 'Hot' : companyData.overall_score > 500 ? 'Warm' : 'Cold',
          
          contacts: [primaryContact],
          
          totalEmails: companyData.total_emails || 0,
          businessScore: companyData.business_score || 0,
          conversationScore: companyData.conversation_score || 0,
          overallScore: companyData.overall_score || 0,
          
          firstContact: companyData.first_contact || new Date().toISOString(),
          latestContact: companyData.latest_contact || new Date().toISOString(),
          
          notes: '',
          emails: (companyData.relevant_emails || []).map((email: any) => ({
            id: uuidv4(),
            date: email.date || new Date().toISOString(),
            subject: email.subject || '',
            type: email.type || 'business',
            keywords: email.keywords || [],
            direction: 'incoming' as const,
            hasAttachments: false
          })),
          followUps: [],
          quotes: [],
          tags: [],
          
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customFields: {}
        };
      });

      dispatch({ type: 'LOAD_COMPANIES', payload: companies });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load CRM data' });
      console.error('Failed to load CRM data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveData = async () => {
    try {
      // In a real app, this would save to a backend
      localStorage.setItem('crm-data', JSON.stringify({
        companies: state.companies,
        settings: state.settings,
        automationRules: state.automationRules,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save CRM data:', error);
    }
  };

  const updateCompany = (company: Company) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: company });
  };

  const deleteCompany = (id: string) => {
    dispatch({ type: 'DELETE_COMPANY', payload: id });
  };

  const moveToStage = (companyId: string, newStatus: Company['status']) => {
    const company = state.companies.find(c => c.id === companyId);
    if (company) {
      const updatedCompany = moveToPipelineStage(company, newStatus, state.automationRules);
      dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
    }
  };

  const updateCompanyNotes = (companyId: string, notes: string) => {
    const company = state.companies.find(c => c.id === companyId);
    if (company) {
      const updatedCompany = { ...company, notes, updatedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
    }
  };

  const updateCompanyPriority = (companyId: string, priority: Company['priority']) => {
    const company = state.companies.find(c => c.id === companyId);
    if (company) {
      const updatedCompany = { ...company, priority, updatedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
    }
  };

  const setFilters = (filters: FilterCriteria) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
  };

  const selectCompany = (id: string) => {
    dispatch({ type: 'TOGGLE_COMPANY_SELECTION', payload: id });
  };

  const selectAllCompanies = () => {
    const allIds = state.filteredCompanies.map(c => c.id);
    dispatch({ type: 'SET_SELECTED_COMPANIES', payload: allIds });
  };

  const clearSelection = () => {
    dispatch({ type: 'SET_SELECTED_COMPANIES', payload: [] });
  };

  const performBulkOperation = (operation: BulkOperation) => {
    dispatch({ type: 'BULK_OPERATION', payload: operation });
  };

  const addFollowUp = async (companyId: string, type: FollowUp['type'], description: string, customDate?: string) => {
    const followUp = scheduleFollowUp(companyId, type, description, customDate);
    
    // Create OpenClaw cron job if automation is enabled
    if (state.settings.integration.enableAutomation) {
      const company = state.companies.find(c => c.id === companyId);
      if (company) {
        const cronJobId = await createOpenClawCronJob(followUp, company.name);
        if (cronJobId) {
          followUp.cronJobId = cronJobId;
        }
      }
    }

    dispatch({ type: 'ADD_FOLLOW_UP', payload: { companyId, followUp } });
  };

  const completeFollowUp = (companyId: string, followUpId: string) => {
    const company = state.companies.find(c => c.id === companyId);
    const followUp = company?.followUps.find(f => f.id === followUpId);
    
    if (followUp) {
      const updatedFollowUp = { ...followUp, completed: true, updatedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_FOLLOW_UP', payload: { companyId, followUp: updatedFollowUp } });
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      // CSV export logic would go here
      console.log('Exporting to CSV...');
    } else {
      // JSON export logic would go here
      console.log('Exporting to JSON...');
    }
  };

  const updateSettings = (settings: Partial<CrmSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const refreshScores = () => {
    dispatch({ type: 'REFRESH_SCORES' });
  };

  const contextValue: CrmContextType = {
    ...state,
    updateCompany,
    deleteCompany,
    moveToStage,
    updateCompanyNotes,
    updateCompanyPriority,
    setFilters,
    clearFilters,
    selectCompany,
    selectAllCompanies,
    clearSelection,
    performBulkOperation,
    addFollowUp,
    completeFollowUp,
    loadData,
    saveData,
    exportData,
    updateSettings,
    refreshScores
  };

  return <CrmContext.Provider value={contextValue}>{children}</CrmContext.Provider>;
};