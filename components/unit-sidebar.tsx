'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, PlusCircle } from 'lucide-react';
import { Unit } from '@/lib/api/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface UnitSidebarProps {
  units: Unit[];
  currentUnit: string | null;
  onUnitSelect: (unitId: string | null) => void;
  userRole: string;
  userUnit: string | null; // Changed from userDepartment to userUnit for consistency with new naming
}

export function UnitSidebar({
  units,
  currentUnit,
  onUnitSelect,
  userRole,
  userUnit // Changed from userDepartment to userUnit
}: UnitSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = userRole === 'ADMIN';
  const isUnitAdmin = userRole === 'UNIT_ADMIN' || userRole === 'ADMIN';

  return (
    <div className="w-64 bg-white border-r p-4 h-full flex flex-col" style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(43, 67, 133, 0.1)' }}>
            <Building2 className="w-6 h-6" style={{ color: '#2B4385' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#2B4385' }}>Units</h2>
        </div>
      </div>

      <div className="space-y-1 flex-1 py-2 overflow-y-auto max-h-[calc(100vh-150px)]">
        <TooltipProvider>
          {units.map((unit) => {
            const isActive = currentUnit === unit.id;
            return (
            <div key={unit.id} className="mb-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto transition-all duration-200 max-w-full overflow-hidden relative"
                    style={{
                      padding: '12px 16px',
                      backgroundColor: isActive ? 'rgba(43, 67, 133, 0.1)' : 'transparent',
                      borderLeft: isActive ? '4px solid #2B4385' : '4px solid transparent',
                      borderRadius: '0 8px 8px 0',
                    }}
                    onClick={() => {
                      onUnitSelect(unit.id);
                    }}
                  >
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <div 
                        className="font-semibold truncate"
                        style={{ 
                          fontSize: '16px', 
                          color: isActive ? '#2B4385' : '#374151',
                        }}
                      >
                        {unit.code || unit.name}
                      </div>
                      {unit.code && (
                        <div 
                          className="mt-1 leading-tight truncate"
                          style={{ 
                            fontSize: '14px', 
                            color: isActive ? '#2B4385' : '#6B7280',
                          }}
                        >
                          {unit.name}
                        </div>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{unit.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )})}
        </TooltipProvider>
      </div>

      {(isAdmin || isUnitAdmin) && (
        <div className="mt-auto pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            className="w-full gap-2"
            style={{ 
              backgroundColor: '#2B4385', 
              color: 'white',
              borderRadius: '8px',
            }}
            onClick={() => router.push('/units/new')}
          >
            <PlusCircle className="w-4 h-4" />
            Add New Unit
          </Button>
        </div>
      )}
    </div>
  );
}