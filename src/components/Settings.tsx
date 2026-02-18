'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Mail,
  Filter,
  Bell,
  Zap,
  Database,
  Shield
} from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, refreshScores, exportData } = useCrm();
  const [activeTab, setActiveTab] = useState<'general' | 'filters' | 'notifications' | 'integration' | 'data'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'filters', name: 'Email Filters', icon: Filter },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integration', name: 'Integration', icon: Zap },
    { id: 'data', name: 'Data Management', icon: Database }
  ];

  const handleSettingChange = (path: string[], value: any) => {
    const updateNestedSetting = (obj: any, paths: string[], val: any): any => {
      if (paths.length === 1) {
        return { ...obj, [paths[0]]: val };
      }
      const [first, ...rest] = paths;
      return {
        ...obj,
        [first]: updateNestedSetting(obj[first] || {}, rest, val)
      };
    };

    const newSettings = updateNestedSetting(settings, path, value);
    updateSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would persist settings to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = (format: 'csv' | 'json') => {
    exportData(format);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          console.log('Import data:', data);
          // In a real app, this would process and import the data
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Auto Follow-up Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Lead Follow-up (days)
            </label>
            <input
              type="number"
              value={settings.autoFollowUpRules.newLead}
              onChange={(e) => handleSettingChange(['autoFollowUpRules', 'newLead'], parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              After Quote Follow-up (days)
            </label>
            <input
              type="number"
              value={settings.autoFollowUpRules.afterQuote}
              onChange={(e) => handleSettingChange(['autoFollowUpRules', 'afterQuote'], parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cold Prospect Follow-up (days)
            </label>
            <input
              type="number"
              value={settings.autoFollowUpRules.coldProspect}
              onChange={(e) => handleSettingChange(['autoFollowUpRules', 'coldProspect'], parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Scoring</h3>
        <div className="space-y-4">
          <button
            onClick={refreshScores}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <RefreshCw size={16} />
            Recalculate All Lead Scores
          </button>
          <p className="text-sm text-gray-600">
            This will recalculate lead scores for all companies based on current business rules.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFilterSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Exclusion Patterns</h3>
        <p className="text-sm text-gray-600 mb-3">
          These patterns will exclude emails from being considered as business prospects.
        </p>
        <div className="space-y-2">
          {settings.emailFilters.excludePatterns.map((pattern, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={pattern}
                onChange={(e) => {
                  const newPatterns = [...settings.emailFilters.excludePatterns];
                  newPatterns[index] = e.target.value;
                  handleSettingChange(['emailFilters', 'excludePatterns'], newPatterns);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newPatterns = settings.emailFilters.excludePatterns.filter((_, i) => i !== index);
                  handleSettingChange(['emailFilters', 'excludePatterns'], newPatterns);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newPatterns = [...settings.emailFilters.excludePatterns, ''];
              handleSettingChange(['emailFilters', 'excludePatterns'], newPatterns);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Pattern
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Keywords</h3>
        <p className="text-sm text-gray-600 mb-3">
          These keywords help identify business-relevant emails and increase lead scores.
        </p>
        <div className="space-y-2">
          {settings.emailFilters.businessKeywords.map((keyword, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  const newKeywords = [...settings.emailFilters.businessKeywords];
                  newKeywords[index] = e.target.value;
                  handleSettingChange(['emailFilters', 'businessKeywords'], newKeywords);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newKeywords = settings.emailFilters.businessKeywords.filter((_, i) => i !== index);
                  handleSettingChange(['emailFilters', 'businessKeywords'], newKeywords);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newKeywords = [...settings.emailFilters.businessKeywords, ''];
              handleSettingChange(['emailFilters', 'businessKeywords'], newKeywords);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Keyword
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Industrial Terms</h3>
        <p className="text-sm text-gray-600 mb-3">
          Industry-specific terms that indicate high-value prospects.
        </p>
        <div className="space-y-2">
          {settings.emailFilters.industrialTerms.map((term, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={term}
                onChange={(e) => {
                  const newTerms = [...settings.emailFilters.industrialTerms];
                  newTerms[index] = e.target.value;
                  handleSettingChange(['emailFilters', 'industrialTerms'], newTerms);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newTerms = settings.emailFilters.industrialTerms.filter((_, i) => i !== index);
                  handleSettingChange(['emailFilters', 'industrialTerms'], newTerms);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newTerms = [...settings.emailFilters.industrialTerms, ''];
              handleSettingChange(['emailFilters', 'industrialTerms'], newTerms);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Term
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.overdueFollowUps}
              onChange={(e) => handleSettingChange(['notifications', 'overdueFollowUps'], e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Overdue Follow-ups</span>
              <p className="text-xs text-gray-500">Get notified when follow-ups are overdue</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.newHighScoreProspects}
              onChange={(e) => handleSettingChange(['notifications', 'newHighScoreProspects'], e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">High Score Prospects</span>
              <p className="text-xs text-gray-500">Get notified when prospects exceed score thresholds</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.pipelineChanges}
              onChange={(e) => handleSettingChange(['notifications', 'pipelineChanges'], e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Pipeline Changes</span>
              <p className="text-xs text-gray-500">Get notified when companies move through pipeline stages</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">OpenClaw Integration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenClaw Webhook URL
            </label>
            <input
              type="url"
              value={settings.integration.openclawWebhookUrl || ''}
              onChange={(e) => handleSettingChange(['integration', 'openclawWebhookUrl'], e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-openclaw-instance.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cron Job Endpoint
            </label>
            <input
              type="url"
              value={settings.integration.cronEndpoint || ''}
              onChange={(e) => handleSettingChange(['integration', 'cronEndpoint'], e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-openclaw-instance.com/api/cron"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.integration.enableAutomation}
              onChange={(e) => handleSettingChange(['integration', 'enableAutomation'], e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Enable Automation</span>
              <p className="text-xs text-gray-500">
                Automatically create cron jobs and send notifications through OpenClaw
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Security Note</h4>
            <p className="text-sm text-blue-700 mt-1">
              Make sure your OpenClaw instance is properly secured and accessible from this CRM system.
              Test the connection after updating these settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleExportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download size={16} />
            Export as CSV
          </button>
          <button
            onClick={() => handleExportData('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download size={16} />
            Export as JSON
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
            <Upload size={16} />
            <span>Choose JSON file to import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-600">
            Import CRM data from a JSON file. Existing data will be merged with imported data.
          </p>
        </div>
      </div>

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-medium text-red-900">Danger Zone</h4>
            <p className="text-sm text-red-700 mt-1 mb-3">
              These actions cannot be undone. Please be certain before proceeding.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all CRM data? This cannot be undone.')) {
                  // In a real app, this would clear all data
                  console.log('Clear all data');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'filters': return renderFilterSettings();
      case 'notifications': return renderNotificationSettings();
      case 'integration': return renderIntegrationSettings();
      case 'data': return renderDataSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon size={28} />
              Settings
            </h2>
            <p className="text-gray-600">Configure your CRM system preferences and integrations</p>
          </div>
          
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Status Messages */}
        {hasChanges && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-600" />
              <span className="text-sm text-yellow-800">
                You have unsaved changes. Don't forget to save your settings.
              </span>
            </div>
          </div>
        )}

        {saving && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-blue-600 animate-spin" />
              <span className="text-sm text-blue-800">Saving settings...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;