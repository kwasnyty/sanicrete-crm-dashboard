'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Company } from '@/types/crm';
import CompanyCard from './CompanyCard';
import { DollarSign, Users } from 'lucide-react';

interface PipelineStageProps {
  id: string;
  name: string;
  color: string;
  companies: Company[];
  totalValue: number;
}

const PipelineStage: React.FC<PipelineStageProps> = ({
  id,
  name,
  color,
  companies,
  totalValue,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col min-w-80 max-w-80">
      {/* Stage Header */}
      <div className={`rounded-t-lg border-2 p-4 ${color} ${isOver ? 'bg-opacity-70' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users size={16} />
            <span>{companies.length}</span>
          </div>
        </div>
        
        {totalValue > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <DollarSign size={16} />
            <span>${totalValue.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Companies List */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-96 bg-white border-x-2 border-b-2 border-t-0 ${
          color.split(' ')[1]
        } p-3 rounded-b-lg ${isOver ? 'bg-gray-50' : ''}`}
      >
        <SortableContext items={companies.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isDragging={false}
              />
            ))}
            
            {companies.length === 0 && (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Drop companies here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default PipelineStage;