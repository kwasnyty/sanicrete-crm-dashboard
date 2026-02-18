'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Company } from '@/types/crm';
import { useCrm } from '@/context/CrmContext';
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Star,
  Clock,
  Edit3,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  isDragging?: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: company.id });

  const { 
    updateCompanyNotes, 
    updateCompanyPriority, 
    selectCompany, 
    selectedCompanies,
    addFollowUp 
  } = useCrm();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(company.notes);
  const [showFollowUpMenu, setShowFollowUpMenu] = useState(false);
  
  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  const isSelected = selectedCompanies.includes(company.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditingNotes && notesInputRef.current) {
      notesInputRef.current.focus();
    }
  }, [isEditingNotes]);

  const handleNotesEdit = () => {
    setIsEditingNotes(true);
  };

  const handleNotesSave = () => {
    updateCompanyNotes(company.id, notes);
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setNotes(company.notes);
    setIsEditingNotes(false);
  };

  const handlePriorityChange = (priority: Company['priority']) => {
    updateCompanyPriority(company.id, priority);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      selectCompany(company.id);
    }
  };

  const handleFollowUpSchedule = (type: '1_week' | '2_weeks' | '1_month') => {
    const description = `Follow up with ${company.name} - ${type.replace('_', ' ')}`;
    addFollowUp(company.id, type, description);
    setShowFollowUpMenu(false);
  };

  const getPriorityColor = (priority: Company['priority']) => {
    switch (priority) {
      case 'Hot': return 'bg-red-500';
      case 'Warm': return 'bg-yellow-500';
      case 'Cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: Company['priority']) => {
    switch (priority) {
      case 'Hot': return <AlertCircle size={16} className="text-red-600" />;
      case 'Warm': return <Clock size={16} className="text-yellow-600" />;
      case 'Cold': return <CheckCircle size={16} className="text-blue-600" />;
    }
  };

  const primaryContact = company.contacts.find(c => c.isPrimary) || company.contacts[0];
  const overdueTasks = company.followUps.filter(f => 
    !f.completed && new Date(f.dueDate) < new Date()
  ).length;

  const recentEmails = company.emails.filter(email => {
    const emailDate = new Date(email.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return emailDate > thirtyDaysAgo;
  }).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer
        hover:shadow-md transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''}
        ${isDragging ? 'rotate-6 z-50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{company.name}</h4>
          <p className="text-sm text-gray-500 truncate">{company.category}</p>
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {/* Priority Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const priorities: Company['priority'][] = ['Cold', 'Warm', 'Hot'];
              const currentIndex = priorities.indexOf(company.priority);
              const nextPriority = priorities[(currentIndex + 1) % priorities.length];
              handlePriorityChange(nextPriority);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: getPriorityColor(company.priority) + '20' }}
          >
            {getPriorityIcon(company.priority)}
            <span>{company.priority}</span>
          </button>

          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              selectCompany(company.id);
            }}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Star size={12} />
          <span>{company.overallScore}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Mail size={12} />
          <span>{recentEmails}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar size={12} />
          <span>{company.followUps.length}</span>
        </div>
      </div>

      {/* Contact Info */}
      {primaryContact && (
        <div className="mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <Users size={12} />
            <span>{primaryContact.firstName} {primaryContact.lastName}</span>
          </div>
          {primaryContact.email && (
            <div className="truncate">{primaryContact.email}</div>
          )}
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-3">
        {isEditingNotes ? (
          <div className="space-y-2">
            <textarea
              ref={notesInputRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="w-full p-2 text-xs border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  handleNotesSave();
                } else if (e.key === 'Escape') {
                  handleNotesCancel();
                }
              }}
            />
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotesSave();
                }}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotesCancel();
                }}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNotesEdit();
            }}
            className="min-h-8 p-2 bg-gray-50 rounded border border-transparent hover:border-gray-300 cursor-text group"
          >
            {company.notes ? (
              <p className="text-xs text-gray-700 line-clamp-3">{company.notes}</p>
            ) : (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Edit3 size={12} />
                <span>Add notes...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFollowUpMenu(!showFollowUpMenu);
            }}
            className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <Calendar size={12} />
            Follow-up
          </button>
          
          {showFollowUpMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-32">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowUpSchedule('1_week');
                }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
              >
                1 Week
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowUpSchedule('2_weeks');
                }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
              >
                2 Weeks
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowUpSchedule('1_month');
                }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
              >
                1 Month
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      {(overdueTasks > 0 || recentEmails > 0) && (
        <div className="flex gap-1 mt-2">
          {overdueTasks > 0 && (
            <div className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              {overdueTasks} overdue
            </div>
          )}
          {recentEmails > 0 && (
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {recentEmails} recent
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyCard;