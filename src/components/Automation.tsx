'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import { AutomationRule } from '@/types/crm';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  Mail,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Settings,
  Calendar,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

const Automation: React.FC = () => {
  const { 
    companies, 
    automationRules, 
    settings,
    updateSettings 
  } = useCrm();

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: {
      type: 'email_received',
      conditions: {}
    },
    actions: [],
    isActive: true
  });

  // Mock automation rules since we don't have them in the context yet
  const mockRules: AutomationRule[] = [
    {
      id: '1',
      name: 'New Lead Auto Follow-up',
      description: 'Automatically schedule follow-up for new leads',
      trigger: {
        type: 'status_change',
        conditions: { to: 'Lead', from: null }
      },
      actions: [
        {
          type: 'create_follow_up',
          data: { type: '1_week', description: 'Initial follow-up for new lead' }
        }
      ],
      isActive: true,
      lastTriggered: '2026-02-17T10:30:00Z'
    },
    {
      id: '2',
      name: 'High Score Lead Alert',
      description: 'Send notification when lead score exceeds 1000',
      trigger: {
        type: 'score_change',
        conditions: { minScore: 1000 }
      },
      actions: [
        {
          type: 'send_notification',
          data: { message: 'High-value lead detected' }
        },
        {
          type: 'update_status',
          data: { newStatus: 'Qualified' }
        }
      ],
      isActive: true,
      lastTriggered: '2026-02-16T14:22:00Z'
    },
    {
      id: '3',
      name: 'Quote Follow-up Reminder',
      description: 'Create follow-up task 3 days after sending quote',
      trigger: {
        type: 'status_change',
        conditions: { to: 'Quoted' }
      },
      actions: [
        {
          type: 'create_follow_up',
          data: { type: 'custom', description: 'Follow up on quote', customDays: 3 }
        }
      ],
      isActive: false,
      lastTriggered: '2026-02-15T09:15:00Z'
    }
  ];

  const triggerTypes = [
    { value: 'email_received', label: 'Email Received', icon: Mail },
    { value: 'status_change', label: 'Status Change', icon: Users },
    { value: 'score_change', label: 'Score Change', icon: Star },
    { value: 'time_based', label: 'Time Based', icon: Clock }
  ];

  const actionTypes = [
    { value: 'create_follow_up', label: 'Create Follow-up', icon: Calendar },
    { value: 'send_notification', label: 'Send Notification', icon: MessageSquare },
    { value: 'update_score', label: 'Update Score', icon: TrendingUp },
    { value: 'update_status', label: 'Update Status', icon: Users }
  ];

  const handleRuleToggle = (ruleId: string) => {
    // In a real app, this would update the rule's active status
    console.log('Toggle rule:', ruleId);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      // In a real app, this would delete the rule
      console.log('Delete rule:', ruleId);
    }
  };

  const handleSaveRule = () => {
    // In a real app, this would save the rule
    console.log('Save rule:', newRule);
    setShowRuleForm(false);
    setEditingRule(null);
    setNewRule({
      name: '',
      description: '',
      trigger: {
        type: 'email_received',
        conditions: {}
      },
      actions: [],
      isActive: true
    });
  };

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        {
          type: 'create_follow_up',
          data: {}
        }
      ]
    }));
  };

  const removeAction = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      ) || []
    }));
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="text-yellow-500" size={28} />
              Automation Rules
            </h2>
            <p className="text-gray-600">Automate your CRM workflows and OpenClaw integrations</p>
          </div>
          
          <button
            onClick={() => setShowRuleForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            Create Rule
          </button>
        </div>

        {/* Integration Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            OpenClaw Integration Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenClaw Webhook URL
              </label>
              <input
                type="url"
                value={settings.integration.openclawWebhookUrl || ''}
                onChange={(e) => updateSettings({
                  integration: {
                    ...settings.integration,
                    openclawWebhookUrl: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-openclaw-instance/webhook"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cron Job Endpoint
              </label>
              <input
                type="url"
                value={settings.integration.cronEndpoint || ''}
                onChange={(e) => updateSettings({
                  integration: {
                    ...settings.integration,
                    cronEndpoint: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-openclaw-instance/api/cron"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.integration.enableAutomation}
                onChange={(e) => updateSettings({
                  integration: {
                    ...settings.integration,
                    enableAutomation: e.target.checked
                  }
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Automation</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, automation rules will create OpenClaw cron jobs and send notifications
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{mockRules.length}</p>
              </div>
              <Zap className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockRules.filter(r => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Rules</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockRules.filter(r => !r.isActive).length}
                </p>
              </div>
              <Pause className="text-red-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Follow-ups</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {companies.reduce((sum, c) => sum + c.followUps.filter(f => !f.completed).length, 0)}
                </p>
              </div>
              <Calendar className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Automation Rules</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {mockRules.map((rule) => {
              const TriggerIcon = triggerTypes.find(t => t.value === rule.trigger.type)?.icon || Zap;
              
              return (
                <div key={rule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <TriggerIcon 
                            size={20} 
                            className={rule.isActive ? 'text-green-600' : 'text-gray-400'} 
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>

                      <div className="ml-11 space-y-3">
                        {/* Trigger */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Trigger:</h5>
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {triggerTypes.find(t => t.value === rule.trigger.type)?.label}
                            {Object.keys(rule.trigger.conditions).length > 0 && (
                              <span className="ml-2 text-xs">
                                ({Object.entries(rule.trigger.conditions).map(([key, value]) => 
                                  `${key}: ${value}`
                                ).join(', ')})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Actions:</h5>
                          <div className="space-y-1">
                            {rule.actions.map((action, index) => {
                              const ActionIcon = actionTypes.find(a => a.value === action.type)?.icon || Zap;
                              return (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <ActionIcon size={14} />
                                  <span>{actionTypes.find(a => a.value === action.type)?.label}</span>
                                  {Object.keys(action.data).length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      ({Object.entries(action.data).map(([key, value]) => 
                                        `${key}: ${value}`
                                      ).join(', ')})
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Last Triggered */}
                        {rule.lastTriggered && (
                          <div className="text-xs text-gray-500">
                            Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleRuleToggle(rule.id)}
                        className={`p-2 rounded-lg ${
                          rule.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={rule.isActive ? 'Pause Rule' : 'Activate Rule'}
                      >
                        {rule.isActive ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setNewRule(rule);
                          setShowRuleForm(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Edit Rule"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Form Modal */}
        {showRuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={newRule.name || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., New Lead Auto Follow-up"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newRule.description || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this rule does..."
                    />
                  </div>
                </div>

                {/* Trigger */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Trigger</h4>
                  <select
                    value={newRule.trigger?.type || 'email_received'}
                    onChange={(e) => setNewRule(prev => ({
                      ...prev,
                      trigger: {
                        type: e.target.value as any,
                        conditions: {}
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {triggerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Actions</h4>
                    <button
                      onClick={addAction}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Action
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newRule.actions?.map((action, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <div className="flex-1">
                          {action.type === 'create_follow_up' && (
                            <select
                              value={action.data.type || '1_week'}
                              onChange={(e) => updateAction(index, 'data', { ...action.data, type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="1_week">1 Week</option>
                              <option value="2_weeks">2 Weeks</option>
                              <option value="1_month">1 Month</option>
                            </select>
                          )}
                          
                          {action.type === 'send_notification' && (
                            <input
                              type="text"
                              value={action.data.message || ''}
                              onChange={(e) => updateAction(index, 'data', { ...action.data, message: e.target.value })}
                              placeholder="Notification message"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          )}

                          {action.type === 'update_score' && (
                            <input
                              type="number"
                              value={action.data.scoreChange || ''}
                              onChange={(e) => updateAction(index, 'data', { ...action.data, scoreChange: parseInt(e.target.value) })}
                              placeholder="Score change (+/-)"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          )}

                          {action.type === 'update_status' && (
                            <select
                              value={action.data.newStatus || 'Lead'}
                              onChange={(e) => updateAction(index, 'data', { ...action.data, newStatus: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Lead">Lead</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Quoted">Quoted</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          )}
                        </div>

                        <button
                          onClick={() => removeAction(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Toggle */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newRule.isActive || false}
                      onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRuleForm(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRule}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Automation;