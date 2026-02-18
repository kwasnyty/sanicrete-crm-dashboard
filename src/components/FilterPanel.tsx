'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import { FilterCriteria } from '@/types/crm';
import {
  Search,
  Filter,
  X,
  Calendar,
  Star,
  Building2,
  Zap,
  Users,
  Tag
} from 'lucide-react';

const FilterPanel: React.FC = () => {
  const { filters, setFilters, clearFilters, filteredCompanies, companies } = useCrm();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const categories = ['Business Prospect', 'Service Provider', 'Construction', 'Food Processing', 'Industrial/Manufacturing'];
  const statuses = ['Lead', 'Qualified', 'Quoted', 'Won', 'Lost'];
  const priorities = ['Hot', 'Warm', 'Cold'];

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleArrayFilterChange = (key: keyof FilterCriteria, value: string, checked: boolean) => {
    const currentArray = (filters[key] as string[]) || [];
    let newArray: string[];
    
    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleFilterChange('searchQuery', query || undefined);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category?.length) count++;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.minScore || filters.maxScore) count++;
    if (filters.hasRecentActivity) count++;
    if (filters.dateRange) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies, contacts, notes, emails..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
              activeFilterCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                clearFilters();
                setSearchQuery('');
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X size={20} />
              Clear
            </button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredCompanies.length} of {companies.length} companies
          </span>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Zap size={14} />
              Hot: {filteredCompanies.filter(c => c.priority === 'Hot').length}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Active: {filteredCompanies.filter(c => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return new Date(c.latestContact) > thirtyDaysAgo;
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Category Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building2 size={16} />
                Category
              </h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(category) || false}
                      onChange={(e) => handleArrayFilterChange('category', category, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users size={16} />
                Status
              </h4>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Zap size={16} />
                Priority
              </h4>
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <label key={priority} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.priority?.includes(priority) || false}
                      onChange={(e) => handleArrayFilterChange('priority', priority, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Score & Activity Filters */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Star size={16} />
                Score & Activity
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Min Score</label>
                  <input
                    type="number"
                    value={filters.minScore || ''}
                    onChange={(e) => handleFilterChange('minScore', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Max Score</label>
                  <input
                    type="number"
                    value={filters.maxScore || ''}
                    onChange={(e) => handleFilterChange('maxScore', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="∞"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasRecentActivity || false}
                    onChange={(e) => handleFilterChange('hasRecentActivity', e.target.checked || undefined)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Recent activity (30 days)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Date Range
            </h4>
            <div className="flex gap-4 items-center">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value ? { 
                    ...filters.dateRange, 
                    start: e.target.value 
                  } : undefined)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value ? { 
                    ...filters.dateRange, 
                    end: e.target.value 
                  } : undefined)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;