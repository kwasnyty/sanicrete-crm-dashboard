'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import Pipeline from './Pipeline';
import FilterPanel from './FilterPanel';
import BulkOperations from './BulkOperations';
import CompanyList from './CompanyList';
import Analytics from './Analytics';
import Automation from './Automation';
import Settings from './Settings';
import {
  LayoutDashboard,
  GitBranch,
  List,
  BarChart3,
  Zap,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  Search,
  Plus
} from 'lucide-react';

type ViewType = 'overview' | 'pipeline' | 'list' | 'analytics' | 'automation' | 'settings';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('pipeline');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { companies, filteredCompanies, selectedCompanies, isLoading } = useCrm();

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'pipeline', name: 'Pipeline', icon: GitBranch },
    { id: 'list', name: 'Company List', icon: List },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'automation', name: 'Automation', icon: Zap },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const getOverdueTasks = () => {
    const now = new Date();
    return companies.reduce((total, company) => {
      return total + company.followUps.filter(f => 
        !f.completed && new Date(f.dueDate) < now
      ).length;
    }, 0);
  };

  const overdueTasks = getOverdueTasks();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading CRM data...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'overview':
        return <div className="p-6">Overview content coming soon...</div>;
      case 'pipeline':
        return <Pipeline />;
      case 'list':
        return <CompanyList />;
      case 'analytics':
        return <Analytics />;
      case 'automation':
        return <Automation />;
      case 'settings':
        return <Settings />;
      default:
        return <Pipeline />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">SaniCrete CRM</h1>
                <p className="text-sm text-gray-600">Interactive Business Tool</p>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Stats */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Companies:</span>
                <span className="font-medium">{companies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filtered:</span>
                <span className="font-medium">{filteredCompanies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected:</span>
                <span className="font-medium">{selectedCompanies.length}</span>
              </div>
              {overdueTasks > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Overdue Tasks:</span>
                  <span className="font-medium">{overdueTasks}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {isSidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                  
                  {/* Notification badge for overdue tasks */}
                  {item.id === 'pipeline' && overdueTasks > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {overdueTasks}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Built for SaniCrete</p>
              <p>Interactive CRM System</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {navigation.find(n => n.id === currentView)?.name}
              </h2>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                  <Plus size={16} />
                  Add Company
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              {overdueTasks > 0 && (
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {overdueTasks}
                  </span>
                </button>
              )}

              {/* Quick Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel (for relevant views) */}
        {['pipeline', 'list', 'analytics'].includes(currentView) && <FilterPanel />}

        {/* Bulk Operations (when companies are selected) */}
        {selectedCompanies.length > 0 && ['pipeline', 'list'].includes(currentView) && (
          <BulkOperations />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;