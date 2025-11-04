'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Building2,
  Users,
  FileText,
  Settings,
  PlusCircle
} from 'lucide-react';
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
    <div className="w-64 bg-muted/40 border-r p-4 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Units
        </h2>
      </div>
      
      <div className="space-y-1 flex-1 overflow-y-auto">
        {units.map((dept) => (
          <div key={dept.id} className="mb-1">
            <Button
              variant={currentUnit === dept.id ? "secondary" : "ghost"}
              className="w-full justify-start px-3 py-2 h-auto"
              onClick={() => {
                onUnitSelect(dept.id);
              }}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="truncate flex-1">{dept.name}</span>
            </Button>
          </div>
        ))}
      </div>
      
      {(isAdmin || isUnitAdmin) && (
        <div className="mt-auto pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/units/new')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Unit
          </Button>
        </div>
      )}
    </div>
  );
}