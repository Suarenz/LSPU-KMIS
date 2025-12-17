/**
 * Target Type Detection and Formatting Utilities
 * 
 * Detects the display type for Strategic Plan targets based on:
 * - Explicit type field from strategic_plan.json
 * - Value format analysis (percentage, currency, count)
 * - Configurable thresholds for low_count vs high_volume
 */

export type TargetDisplayType = 'percentage' | 'currency' | 'high_volume' | 'low_count' | 'milestone';

export interface TargetConfig {
  type?: string;
  currency?: string;
  low_count_threshold?: number;
  unit_basis?: string;
}

export interface DetectionResult {
  displayType: TargetDisplayType;
  formattedTarget: string;
  formattedCurrent: string;
  progressPercent: number;
  isCurrency: boolean;
  currencySymbol: string;
}

// Default threshold for distinguishing low_count from high_volume
const DEFAULT_LOW_COUNT_THRESHOLD = 10;

/**
 * Detects the appropriate display type for a target value
 */
export function detectTargetType(
  targetValue: string | number,
  currentValue: string | number | undefined,
  config: TargetConfig = {}
): TargetDisplayType {
  const { type, currency, low_count_threshold = DEFAULT_LOW_COUNT_THRESHOLD } = config;

  // 1. Explicit percentage type
  if (type === 'percentage') {
    return 'percentage';
  }

  // 2. Financial/currency type
  if (type === 'financial' || currency) {
    return 'currency';
  }

  // 3. Milestone/qualitative type (text-based targets)
  if (type === 'milestone' || type === 'text_condition') {
    return 'milestone';
  }

  // 4. String values that aren't explicitly typed → milestone
  if (typeof targetValue === 'string') {
    // Check if it contains percentage symbol
    if (targetValue.includes('%')) {
      return 'percentage';
    }
    // Check for currency indicators
    if (targetValue.includes('₱') || targetValue.toLowerCase().includes('php')) {
      return 'currency';
    }
    // Check if it's a parseable number
    const parsed = parseFloat(targetValue.replace(/,/g, ''));
    if (isNaN(parsed)) {
      return 'milestone';
    }
    // Use parsed number for threshold check
    return parsed <= low_count_threshold ? 'low_count' : 'high_volume';
  }

  // 5. Numeric values - check threshold
  if (typeof targetValue === 'number') {
    return targetValue <= low_count_threshold ? 'low_count' : 'high_volume';
  }

  // Default fallback
  return 'milestone';
}

/**
 * Normalizes currency symbols to ₱ (Philippine Peso sign)
 */
export function normalizeCurrency(value: string): string {
  return value
    .replace(/PHP\s*/gi, '₱')
    .replace(/Php\s*/gi, '₱')
    .replace(/php\s*/gi, '₱');
}

/**
 * Formats a number as Philippine Peso currency
 * Uses compact notation for large values (e.g., ₱375k, ₱1.2M)
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `₱${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `₱${(value / 1_000).toFixed(0)}k`;
  }
  return `₱${value.toLocaleString()}`;
}

/**
 * Formats a number with compact notation (no currency)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 10_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return value.toLocaleString();
}

/**
 * Parses a value to extract numeric content
 */
export function parseNumericValue(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[₱$,\s]/g, '').replace(/PHP/gi, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates progress percentage from current and target values
 */
export function calculateProgress(
  currentValue: string | number | undefined,
  targetValue: string | number,
  displayType: TargetDisplayType
): number {
  // Milestones use exact match logic
  if (displayType === 'milestone') {
    if (!currentValue) return 0;
    return String(currentValue).toLowerCase() === String(targetValue).toLowerCase() ? 100 : 50;
  }

  const current = parseNumericValue(currentValue ?? 0);
  const target = parseNumericValue(targetValue);

  if (target === 0) return 0;

  // For percentage type, current value IS the percentage
  if (displayType === 'percentage') {
    return Math.min(100, Math.max(0, current));
  }

  // For other numeric types, calculate ratio
  const ratio = (current / target) * 100;
  return Math.min(100, Math.max(0, ratio));
}

/**
 * Determines milestone status based on current vs target value
 */
export function getMilestoneStatus(
  currentValue: string | number | undefined,
  targetValue: string | number
): 'completed' | 'in_progress' | 'pending' {
  if (!currentValue || currentValue === '') {
    return 'pending';
  }
  
  const currentStr = String(currentValue).toLowerCase().trim();
  const targetStr = String(targetValue).toLowerCase().trim();
  
  if (currentStr === targetStr) {
    return 'completed';
  }
  
  return 'in_progress';
}

/**
 * Full detection and formatting result
 */
export function getTargetDisplayInfo(
  targetValue: string | number,
  currentValue: string | number | undefined,
  config: TargetConfig = {}
): DetectionResult {
  const displayType = detectTargetType(targetValue, currentValue, config);
  const isCurrency = displayType === 'currency';
  const currencySymbol = isCurrency ? '₱' : '';

  let formattedTarget: string;
  let formattedCurrent: string;

  switch (displayType) {
    case 'percentage':
      formattedTarget = `${parseNumericValue(targetValue)}%`;
      formattedCurrent = currentValue !== undefined ? `${parseNumericValue(currentValue)}%` : '0%';
      break;

    case 'currency':
      formattedTarget = formatCurrency(parseNumericValue(targetValue));
      formattedCurrent = currentValue !== undefined 
        ? formatCurrency(parseNumericValue(currentValue)) 
        : '₱0';
      break;

    case 'high_volume':
      formattedTarget = formatCompactNumber(parseNumericValue(targetValue));
      formattedCurrent = currentValue !== undefined 
        ? formatCompactNumber(parseNumericValue(currentValue)) 
        : '0';
      break;

    case 'low_count':
      formattedTarget = String(parseNumericValue(targetValue));
      formattedCurrent = currentValue !== undefined 
        ? String(parseNumericValue(currentValue)) 
        : '0';
      break;

    case 'milestone':
    default:
      formattedTarget = String(targetValue);
      formattedCurrent = currentValue !== undefined ? String(currentValue) : '';
      break;
  }

  const progressPercent = calculateProgress(currentValue, targetValue, displayType);

  return {
    displayType,
    formattedTarget,
    formattedCurrent,
    progressPercent,
    isCurrency,
    currencySymbol,
  };
}
