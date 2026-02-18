'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Company } from '@/types/crm';
import { useCrm } from '@/context/CrmContext';
import PipelineStage from './PipelineStage';
import CompanyCard from './CompanyCard';

const PIPELINE_STAGES = [
  { id: 'Lead', name: 'Leads', color: 'bg-blue-100 border-blue-300' },
  { id: 'Qualified', name: 'Qualified', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'Quoted', name: 'Quoted', color: 'bg-purple-100 border-purple-300' },
  { id: 'Won', name: 'Won', color: 'bg-green-100 border-green-300' },
  { id: 'Lost', name: 'Lost', color: 'bg-red-100 border-red-300' },
];

const Pipeline: React.FC = () => {
  const { filteredCompanies, moveToStage } = useCrm();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const companyId = active.id as string;
    const newStage = over.id as Company['status'];

    // Find the current stage of the dragged company
    const company = filteredCompanies.find(c => c.id === companyId);
    if (!company) return;

    // Only move if the stage is different
    if (company.status !== newStage) {
      moveToStage(companyId, newStage);
    }
  };

  const getCompaniesForStage = (status: Company['status']) => {
    return filteredCompanies.filter(company => company.status === status);
  };

  const activeCompany = activeId ? filteredCompanies.find(c => c.id === activeId) : null;

  return (
    <div className="h-full bg-gray-50">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full p-6 overflow-x-auto">
          {PIPELINE_STAGES.map((stage) => {
            const companies = getCompaniesForStage(stage.id as Company['status']);
            const totalValue = companies.reduce((sum, company) => {
              const avgQuoteValue = company.quotes.length > 0
                ? company.quotes.reduce((s, q) => s + q.amount, 0) / company.quotes.length
                : 0;
              return sum + avgQuoteValue;
            }, 0);

            return (
              <PipelineStage
                key={stage.id}
                id={stage.id}
                name={stage.name}
                color={stage.color}
                companies={companies}
                totalValue={totalValue}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeCompany && (
            <div className="transform rotate-6 opacity-90">
              <CompanyCard
                company={activeCompany}
                isDragging={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Pipeline;