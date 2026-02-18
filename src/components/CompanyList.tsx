'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import { Company } from '@/types/crm';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';

type SortField = 'name' | 'category' | 'status' | 'priority' | 'overallScore' | 'totalEmails' | 'latestContact';
type SortDirection = 'asc' | 'desc';

const CompanyList: React.FC = () => {
  const { 
    filteredCompanies, 
    selectedCompanies, 
    selectCompany, 
    updateCompanyPriority,
    moveToStage,
    addFollowUp,
    deleteCompany
  } = useCrm();

  const [sortField, setSortField] = useState<SortField>('latestContact');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle special cases
    if (sortField === 'latestContact') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp size={14} className="text-blue-500" /> : 
      <ArrowDown size={14} className="text-blue-500" />;
  };

  const getPriorityColor = (priority: Company['priority']) => {
    switch (priority) {
      case 'Hot': return 'text-red-600 bg-red-50';
      case 'Warm': return 'text-yellow-600 bg-yellow-50';
      case 'Cold': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'Lead': return 'text-blue-600 bg-blue-50';
      case 'Qualified': return 'text-yellow-600 bg-yellow-50';
      case 'Quoted': return 'text-purple-600 bg-purple-50';
      case 'Won': return 'text-green-600 bg-green-50';
      case 'Lost': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const toggleExpanded = (companyId: string) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  return (
    <div className="h-full bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Company
                  <SortIcon field="name" />
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  Category
                  <SortIcon field="category" />
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('overallScore')}
              >
                <div className="flex items-center gap-1">
                  Score
                  <SortIcon field="overallScore" />
                </div>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('latestContact')}
              >
                <div className="flex items-center gap-1">
                  Last Contact
                  <SortIcon field="latestContact" />
                </div>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCompanies.map((company) => {
              const isSelected = selectedCompanies.includes(company.id);
              const isExpanded = expandedCompany === company.id;
              const primaryContact = company.contacts.find(c => c.isPrimary) || company.contacts[0];
              
              const overdueTasks = company.followUps.filter(f => 
                !f.completed && new Date(f.dueDate) < new Date()
              ).length;

              return (
                <React.Fragment key={company.id}>
                  <tr 
                    className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => toggleExpanded(company.id)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          selectCompany(company.id);
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          {company.website && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <ExternalLink size={12} />
                              {company.website}
                            </div>
                          )}
                        </div>
                        {overdueTasks > 0 && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle size={12} />
                            <span>{overdueTasks}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{company.category}</span>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={company.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          moveToStage(company.id, e.target.value as Company['status']);
                        }}
                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(company.status)}`}
                      >
                        <option value="Lead">Lead</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={company.priority}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateCompanyPriority(company.id, e.target.value as Company['priority']);
                        }}
                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(company.priority)}`}
                      >
                        <option value="Cold">Cold</option>
                        <option value="Warm">Warm</option>
                        <option value="Hot">Hot</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="text-sm font-medium">{company.overallScore}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {primaryContact && (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {primaryContact.firstName} {primaryContact.lastName}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {primaryContact.email}
                          </div>
                          {primaryContact.phone && (
                            <div className="text-gray-500 flex items-center gap-1">
                              <Phone size={12} />
                              {primaryContact.phone}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(company.latestContact)}</div>
                      <div className="text-xs text-gray-500">{company.totalEmails} emails</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addFollowUp(company.id, '1_week', `Follow up with ${company.name}`);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Schedule Follow-up"
                        >
                          <Calendar size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open company details modal
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open edit modal
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete ${company.name}?`)) {
                              deleteCompany(company.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Recent Emails */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                              <Mail size={16} />
                              Recent Emails ({company.emails.length})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {company.emails.slice(0, 5).map((email) => (
                                <div key={email.id} className="text-sm bg-white p-2 rounded border">
                                  <div className="font-medium text-gray-900 truncate">{email.subject}</div>
                                  <div className="text-gray-500 text-xs">{formatDate(email.date)}</div>
                                  <div className="flex gap-1 mt-1">
                                    {email.keywords.slice(0, 3).map(keyword => (
                                      <span key={keyword} className="bg-blue-100 text-blue-700 text-xs px-1 rounded">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Follow-ups */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                              <Calendar size={16} />
                              Follow-ups ({company.followUps.length})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {company.followUps.slice(0, 5).map((followUp) => (
                                <div key={followUp.id} className="text-sm bg-white p-2 rounded border">
                                  <div className="flex items-center justify-between">
                                    <div className={`font-medium ${followUp.completed ? 'text-green-600' : 'text-gray-900'}`}>
                                      {followUp.description}
                                    </div>
                                    {followUp.completed ? (
                                      <CheckCircle size={14} className="text-green-600" />
                                    ) : (
                                      <Clock size={14} className="text-gray-400" />
                                    )}
                                  </div>
                                  <div className="text-gray-500 text-xs">{formatDate(followUp.dueDate)}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                            <div className="text-sm bg-white p-2 rounded border min-h-16">
                              {company.notes || 'No notes added yet'}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {sortedCompanies.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyList;