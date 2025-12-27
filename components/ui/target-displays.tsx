'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

/**
 * PercentageProgress - Progress bar for percentage-type targets
 * 
 * Track: Light Gray (#f3f4f6)
 * Fill: Blue (#3b82f6)
 */
interface PercentageProgressProps {
  currentValue: number;
  targetValue: number;
  showLabel?: boolean;
  className?: string;
}

export function PercentageProgress({
  currentValue,
  targetValue,
  showLabel = true,
  className,
}: PercentageProgressProps) {
  // For percentage targets, calculate achievement: (currentValue / targetValue) * 100
  // E.g., if current employment rate is 48% and target is 73%, achievement is 48/73 = 65.75%
  const achievement = targetValue > 0 ? Math.min(100, Math.max(0, (currentValue / targetValue) * 100)) : 0;
  const isComplete = currentValue >= targetValue;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 relative">
        <Progress
          value={achievement}
          className="h-4 bg-gray-200 *:data-[slot=progress-indicator]:bg-blue-500"
        />
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
            {currentValue}% / {targetValue}%
          </span>
        )}
      </div>
      {isComplete && (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      )}
    </div>
  );
}

/**
 * CurrencyProgress - Progress bar for financial/currency targets
 * 
 * Shows absolute values (₱120k / ₱375k) instead of percentages
 */
interface CurrencyProgressProps {
  currentValue: number;
  targetValue: number;
  formattedCurrent: string;
  formattedTarget: string;
  className?: string;
}

export function CurrencyProgress({
  currentValue,
  targetValue,
  formattedCurrent,
  formattedTarget,
  className,
}: CurrencyProgressProps) {
  const progress = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0;
  const isComplete = currentValue >= targetValue;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 relative">
        <Progress
          value={progress}
          className="h-5 bg-gray-200 *:data-[slot=progress-indicator]:bg-blue-500"
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
          {formattedCurrent} / {formattedTarget}
        </span>
      </div>
      {isComplete && (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      )}
    </div>
  );
}

/**
 * HighVolumeProgress - Progress bar for high volume numeric targets (>10)
 * 
 * Similar to currency but without the peso symbol
 */
interface HighVolumeProgressProps {
  currentValue: number;
  targetValue: number;
  formattedCurrent: string;
  formattedTarget: string;
  unit?: string;
  className?: string;
}

export function HighVolumeProgress({
  currentValue,
  targetValue,
  formattedCurrent,
  formattedTarget,
  unit = '',
  className,
}: HighVolumeProgressProps) {
  const progress = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0;
  const isComplete = currentValue >= targetValue;

  const label = unit 
    ? `${formattedCurrent} / ${formattedTarget} ${unit}`
    : `${formattedCurrent} / ${formattedTarget}`;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 relative">
        <Progress
          value={progress}
          className="h-5 bg-gray-200 *:data-[slot=progress-indicator]:bg-blue-500"
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
          {label}
        </span>
      </div>
      {isComplete && (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      )}
    </div>
  );
}

/**
 * FractionalDisplay - Bold text display for low count targets (≤10)
 * 
 * Display format: "3 / 6" (current / target)
 * Do NOT use progress bar - looks cluttered for small numbers
 */
interface FractionalDisplayProps {
  currentValue: number;
  targetValue: number;
  unit?: string;
  className?: string;
}

export function FractionalDisplay({
  currentValue,
  targetValue,
  unit = '',
  className,
}: FractionalDisplayProps) {
  const isComplete = currentValue >= targetValue;
  const ratio = targetValue > 0 ? currentValue / targetValue : 0;
  
  // Color based on completion ratio
  let textColor = 'text-gray-600';
  if (isComplete) {
    textColor = 'text-green-600';
  } else if (ratio >= 0.5) {
    textColor = 'text-blue-600';
  } else if (ratio > 0) {
    textColor = 'text-yellow-600';
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-lg font-bold', textColor)}>
        {currentValue}
        <span className="text-gray-400 mx-1">/</span>
        {targetValue}
      </span>
      {unit && <span className="text-sm text-gray-500">{unit}</span>}
      {isComplete && (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      )}
    </div>
  );
}

/**
 * StatusBadge - Badge for milestone/qualitative targets
 * 
 * COMPLETED: Green Badge (current === target)
 * IN PROGRESS: Blue Badge (current !== target && current not empty)
 * PENDING: Gray Badge (current empty)
 */
interface StatusBadgeProps {
  status: 'completed' | 'in_progress' | 'pending';
  currentValue?: string;
  targetValue: string;
  className?: string;
}

export function StatusBadge({
  status,
  currentValue,
  targetValue,
  className,
}: StatusBadgeProps) {
  const config = {
    completed: {
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
      icon: CheckCircle2,
      label: currentValue || targetValue,
    },
    in_progress: {
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
      icon: Clock,
      label: currentValue || 'In Progress',
    },
    pending: {
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
      icon: AlertCircle,
      label: 'Pending',
    },
  };

  const { variant, className: badgeClassName, icon: Icon, label } = config[status];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Badge variant={variant} className={cn('flex items-center gap-1', badgeClassName)}>
        <Icon className="h-3 w-3" />
        <span className="truncate max-w-[200px]">{label}</span>
      </Badge>
      {status !== 'completed' && (
        <span className="text-xs text-gray-500 truncate max-w-[200px]">
          Target: {targetValue}
        </span>
      )}
    </div>
  );
}

/**
 * CurrentValueInput - Editable input for entering current values
 */
interface CurrentValueInputProps {
  value: string | number;
  onChange: (value: string) => void;
  type: 'number' | 'text' | 'percentage' | 'currency';
  placeholder?: string;
  className?: string;
}

export function CurrentValueInput({
  value,
  onChange,
  type,
  placeholder = 'Enter current value',
  className,
}: CurrentValueInputProps) {
  const inputType = type === 'text' ? 'text' : 'number';
  const prefix = type === 'currency' ? '₱' : type === 'percentage' ? '' : '';
  const suffix = type === 'percentage' ? '%' : '';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {suffix && <span className="text-gray-500 text-sm">{suffix}</span>}
    </div>
  );
}
