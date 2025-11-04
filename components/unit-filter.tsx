'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { Unit } from '@/lib/api/types';

interface UnitFilterProps {
  units: Unit[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}
 
export function UnitFilter({
  units,
  value,
  onChange,
  placeholder = "All Units"
}: UnitFilterProps) {
  return (
    <Select 
      value={value || "all"} 
      onValueChange={(val) => onChange(val === "all" ? null : val)}
    >
      <SelectTrigger className="w-full md:w-48">
        <Building2 className="w-4 h-4 mr-2" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.code} - {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}