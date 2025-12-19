'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type TargetType = 'MILESTONE' | 'COUNT' | 'PERCENTAGE' | 'FINANCIAL' | 'TEXT_CONDITION';

export interface DynamicInputProps {
  targetType: TargetType;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * DynamicInput Component
 * 
 * Renders different input types based on the target_type:
 * - MILESTONE: Checkbox (0/1)
 * - COUNT: Number input (integers only)
 * - PERCENTAGE: Number input with % suffix (0-100)
 * - FINANCIAL: Currency input with ₱ prefix and thousand separators
 * - TEXT_CONDITION: Dropdown (Met/Not Met/In Progress)
 */
export function DynamicInput({
  targetType,
  value,
  onChange,
  placeholder = '',
  className,
  disabled = false,
}: DynamicInputProps) {
  switch (targetType) {
    case 'MILESTONE':
      return (
        <MilestoneInput
          value={value}
          onChange={onChange}
          className={className}
          disabled={disabled}
        />
      );

    case 'COUNT':
      return (
        <CountInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
      );

    case 'PERCENTAGE':
      return (
        <PercentageInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
      );

    case 'FINANCIAL':
      return (
        <FinancialInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
      );

    case 'TEXT_CONDITION':
      return (
        <TextConditionInput
          value={value}
          onChange={onChange}
          className={className}
          disabled={disabled}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 text-sm border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            disabled && 'bg-gray-100 cursor-not-allowed',
            className
          )}
        />
      );
  }
}

/**
 * Milestone Input - Checkbox for binary completion (0/1)
 */
function MilestoneInput({
  value,
  onChange,
  className,
  disabled,
}: Omit<DynamicInputProps, 'targetType' | 'placeholder'>) {
  const isChecked = value === 1 || value === '1';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
        disabled={disabled}
        className="h-5 w-5"
      />
      <span className="text-sm text-gray-600">
        {isChecked ? 'Achieved' : 'Pending'}
      </span>
    </div>
  );
}

/**
 * Count Input - Integer numbers only
 */
function CountInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: Omit<DynamicInputProps, 'targetType'>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow empty string or integers only
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      onChange(inputValue === '' ? '' : parseInt(inputValue, 10));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || '0'}
      disabled={disabled}
      className={cn(
        'w-32 px-3 py-2 text-sm text-right border border-gray-300 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        disabled && 'bg-gray-100 cursor-not-allowed',
        className
      )}
    />
  );
}

/**
 * Percentage Input - Decimals allowed, 0-100 range with % suffix
 */
function PercentageInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: Omit<DynamicInputProps, 'targetType'>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow empty string, numbers with optional decimal point
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      const numValue = parseFloat(inputValue);
      // Validate range 0-100
      if (inputValue === '' || (numValue >= 0 && numValue <= 100)) {
        onChange(inputValue);
      }
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || '0'}
        disabled={disabled}
        className={cn(
          'w-24 px-3 py-2 text-sm text-right border border-gray-300 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          disabled && 'bg-gray-100 cursor-not-allowed'
        )}
      />
      <span className="text-sm text-gray-500 font-medium">%</span>
    </div>
  );
}

/**
 * Financial Input - Currency with ₱ prefix and thousand separators
 */
function FinancialInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: Omit<DynamicInputProps, 'targetType'>) {
  // Format number with thousand separators
  const formatCurrency = (num: string | number): string => {
    if (!num && num !== 0) return '';
    const numStr = num.toString().replace(/,/g, '');
    const [intPart, decimalPart] = numStr.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, ''); // Remove existing commas
    // Allow empty string, numbers with optional decimal point (max 2 decimal places)
    if (inputValue === '' || /^\d*\.?\d{0,2}$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const displayValue = formatCurrency(value);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-sm text-gray-500 font-medium">₱</span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder || '0.00'}
        disabled={disabled}
        className={cn(
          'w-36 px-3 py-2 text-sm text-right border border-gray-300 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          disabled && 'bg-gray-100 cursor-not-allowed'
        )}
      />
    </div>
  );
}

/**
 * Text Condition Input - Dropdown for qualitative status
 */
function TextConditionInput({
  value,
  onChange,
  className,
  disabled,
}: Omit<DynamicInputProps, 'targetType' | 'placeholder'>) {
  const options = [
    { value: 'Met', label: 'Met' },
    { value: 'Not Met', label: 'Not Met' },
    { value: 'In Progress', label: 'In Progress' },
  ];

  return (
    <Select
      value={value.toString()}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-40', className)}>
        <SelectValue placeholder="Select status..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Helper function to validate input based on target type
 */
export function validateDynamicInput(
  targetType: TargetType,
  value: string | number
): { isValid: boolean; error?: string } {
  if (!value && value !== 0) {
    return { isValid: false, error: 'Value is required' };
  }

  switch (targetType) {
    case 'MILESTONE':
      if (value !== 0 && value !== 1 && value !== '0' && value !== '1') {
        return { isValid: false, error: 'Milestone must be 0 or 1' };
      }
      return { isValid: true };

    case 'COUNT':
      if (!/^\d+$/.test(value.toString())) {
        return { isValid: false, error: 'Count must be a whole number' };
      }
      return { isValid: true };

    case 'PERCENTAGE':
      const percentValue = parseFloat(value.toString());
      if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
        return { isValid: false, error: 'Percentage must be between 0 and 100' };
      }
      return { isValid: true };

    case 'FINANCIAL':
      const financialValue = parseFloat(value.toString().replace(/,/g, ''));
      if (isNaN(financialValue) || financialValue < 0) {
        return { isValid: false, error: 'Amount must be a positive number' };
      }
      // Check max 2 decimal places
      if (!/^\d+(\.\d{0,2})?$/.test(value.toString().replace(/,/g, ''))) {
        return { isValid: false, error: 'Amount must have at most 2 decimal places' };
      }
      return { isValid: true };

    case 'TEXT_CONDITION':
      const validStatuses = ['Met', 'Not Met', 'In Progress'];
      if (!validStatuses.includes(value.toString())) {
        return { isValid: false, error: 'Invalid status' };
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

/**
 * Helper function to format display value based on target type
 */
export function formatDisplayValue(targetType: TargetType, value: string | number): string {
  if (!value && value !== 0) return '-';

  switch (targetType) {
    case 'MILESTONE':
      return value === 1 || value === '1' ? 'Achieved' : 'Pending';

    case 'COUNT':
      return value.toString();

    case 'PERCENTAGE':
      return `${value}%`;

    case 'FINANCIAL':
      const numValue = parseFloat(value.toString().replace(/,/g, ''));
      return `₱${numValue.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    case 'TEXT_CONDITION':
      return value.toString();

    default:
      return value.toString();
  }
}
