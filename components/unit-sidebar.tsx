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
    <div className="w-64 bg-gradient-to-b from-background to-muted/20 border-r p-4 h-full flex flex-col shadow-sm">
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Units</h2>
        </div>
      </div>

      <div className="space-y-1 flex-1 py-4">
        <TooltipProvider>
          {units.map((unit) => (
            <div key={unit.id} className="mb-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentUnit === unit.id ? "secondary" : "ghost"}
                    className={`w-full justify-start px-3 py-3 h-auto transition-all duration-200 max-w-full overflow-hidden ${
                      currentUnit === unit.id
                        ? 'shadow-sm border-l-4 border-primary bg-secondary/50'
                        : 'hover:bg-accent hover:shadow-sm'
                    }`}
                    onClick={() => {
                      onUnitSelect(unit.id);
                    }}
                  >
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <div className="font-medium text-sm truncate">
                        {unit.code || unit.name}
                      </div>
                      {unit.code && (
                        <div className="text-xs text-muted-foreground mt-1 leading-tight break-words pr-6 truncate">{unit.name}</div>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{unit.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {(isAdmin || isUnitAdmin) && (
        <div className="mt-auto pt-4 border-t border-border">
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
            onClick={() => router.push('/units/new')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Unit
          </Button>
        </div>
      )}
    </div>
  );
}