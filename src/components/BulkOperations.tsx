'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import { BulkOperation, Company } from '@/types/crm';
import {
  CheckSquare,
  Square,
  MoreHorizontal,
  Trash2,
  Tag,
  Calendar,
  Zap,
  Users,
  X,
  AlertTriangle
} from 'lucide-react';

const BulkOperations: React.FC = () => {
  const { 
    selectedCompanies, 
    filteredCompanies, 
    selectAllCompanies, 
    clearSelection, 
    performBulkOperation 
  } = useCrm();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<BulkOperation | null>(null);

  const selectedCount = selectedCompanies.length;
  const totalCount = filteredCompanies.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllCompanies();
    }
  };

  const handleBulkOperation = (operation: BulkOperation) => {
    if (operation.action === 'delete') {
      setShowConfirmDialog(operation);
    } else {
      performBulkOperation(operation);
      setIsMenuOpen(false);
    }
  };

  const confirmOperation = () => {
    if (showConfirmDialog) {
      performBulkOperation(showConfirmDialog);
      setShowConfirmDialog(null);
      setIsMenuOpen(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Select All Checkbox */}
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
            >
              {isAllSelected ? (
                <CheckSquare size={20} />
              ) : isPartiallySelected ? (
                <div className="relative">
                  <Square size={20} />
                  <div className="absolute top-2 left-2 w-2 h-2 bg-blue-600 rounded-sm"></div>
                </div>
              ) : (
                <Square size={20} />
              )}
              <span className="font-medium">
                {isAllSelected ? 'Deselect All' : `Select All (${totalCount})`}
              </span>
            </button>

            {/* Selection Count */}
            <div className="text-blue-700">
              <span className="font-medium">{selectedCount}</span> companies selected
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => handleBulkOperation({
                  action: 'updatePriority',
                  companyIds: selectedCompanies,
                  data: { priority: 'Hot' }
                })}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center gap-1"
              >
                <Zap size={14} />
                Hot
              </button>
              
              <button
                onClick={() => handleBulkOperation({
                  action: 'updatePriority',
                  companyIds: selectedCompanies,
                  data: { priority: 'Warm' }
                })}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 flex items-center gap-1"
              >
                <Zap size={14} />
                Warm
              </button>
              
              <button
                onClick={() => handleBulkOperation({
                  action: 'updateStatus',
                  companyIds: selectedCompanies,
                  data: { status: 'Qualified' }
                })}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 flex items-center gap-1"
              >
                <Users size={14} />
                Qualify
              </button>
            </div>

            {/* More Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg"
              >
                <MoreHorizontal size={20} />
              </button>

              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {/* Status Updates */}
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                      Update Status
                    </div>
                    
                    {(['Lead', 'Qualified', 'Quoted', 'Won', 'Lost'] as Company['status'][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleBulkOperation({
                          action: 'updateStatus',
                          companyIds: selectedCompanies,
                          data: { status }
                        })}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Users size={14} />
                        {status}
                      </button>
                    ))}

                    <div className="border-t border-gray-100"></div>

                    {/* Priority Updates */}
                    <div className="px-3 py-2 text-sm font-medium text-gray-900">
                      Update Priority
                    </div>
                    
                    {(['Hot', 'Warm', 'Cold'] as Company['priority'][]).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => handleBulkOperation({
                          action: 'updatePriority',
                          companyIds: selectedCompanies,
                          data: { priority }
                        })}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Zap size={14} />
                        {priority}
                      </button>
                    ))}

                    <div className="border-t border-gray-100"></div>

                    {/* Follow-up Actions */}
                    <div className="px-3 py-2 text-sm font-medium text-gray-900">
                      Schedule Follow-up
                    </div>
                    
                    <button
                      onClick={() => handleBulkOperation({
                        action: 'scheduleFollowUp',
                        companyIds: selectedCompanies,
                        data: { type: '1_week', description: 'Bulk follow-up - 1 week' }
                      })}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Calendar size={14} />
                      1 Week
                    </button>
                    
                    <button
                      onClick={() => handleBulkOperation({
                        action: 'scheduleFollowUp',
                        companyIds: selectedCompanies,
                        data: { type: '2_weeks', description: 'Bulk follow-up - 2 weeks' }
                      })}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Calendar size={14} />
                      2 Weeks
                    </button>
                    
                    <button
                      onClick={() => handleBulkOperation({
                        action: 'scheduleFollowUp',
                        companyIds: selectedCompanies,
                        data: { type: '1_month', description: 'Bulk follow-up - 1 month' }
                      })}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Calendar size={14} />
                      1 Month
                    </button>

                    <div className="border-t border-gray-100"></div>

                    {/* Add Tags */}
                    <button
                      onClick={() => {
                        const tag = prompt('Enter tag name:');
                        if (tag) {
                          handleBulkOperation({
                            action: 'addTag',
                            companyIds: selectedCompanies,
                            data: { tag }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Tag size={14} />
                      Add Tag
                    </button>

                    <div className="border-t border-gray-100"></div>

                    {/* Delete */}
                    <button
                      onClick={() => handleBulkOperation({
                        action: 'delete',
                        companyIds: selectedCompanies,
                        data: {}
                      })}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete Companies
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear Selection */}
            <button
              onClick={clearSelection}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedCount} companies? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmOperation}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default BulkOperations;