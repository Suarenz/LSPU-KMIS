/**
 * Utility functions for handling target types in KPI progress tracking
 */

export type TargetType = 'MILESTONE' | 'COUNT' | 'PERCENTAGE' | 'FINANCIAL' | 'TEXT_CONDITION';

/**
 * Maps strategic plan target types to the database enum TargetType
 */
export function mapTargetType(planType: string | undefined): TargetType {
  if (!planType) return 'COUNT'; // Default to count

  const normalized = planType.toLowerCase().trim();

  // Milestone/binary targets
  if (normalized.includes('milestone') || normalized.includes('binary') || normalized === 'boolean') {
    return 'MILESTONE';
  }

  // Percentage targets
  if (normalized.includes('percentage') || normalized.includes('percent') || normalized.includes('rate')) {
    return 'PERCENTAGE';
  }

  // Financial targets
  if (normalized.includes('currency') || normalized.includes('financial') || normalized.includes('budget') || 
      normalized.includes('revenue') || normalized.includes('cost')) {
    return 'FINANCIAL';
  }

  // Text/qualitative conditions
  if (normalized.includes('text') || normalized.includes('condition') || normalized.includes('status') ||
      normalized.includes('qualitative')) {
    return 'TEXT_CONDITION';
  }

  // Count/numeric (default)
  if (normalized.includes('count') || normalized.includes('numeric') || normalized.includes('number') ||
      normalized.includes('quantity')) {
    return 'COUNT';
  }

  // Default to count for any unrecognized type
  return 'COUNT';
}

/**
 * Converts current_value string from database to appropriate type for display
 */
export function parseCurrentValue(
  currentValue: string | null | undefined,
  targetType: TargetType
): number | string {
  if (!currentValue && currentValue !== '0') {
    // Return appropriate default based on type
    if (targetType === 'MILESTONE') return 0;
    if (targetType === 'TEXT_CONDITION') return '';
    return 0;
  }

  switch (targetType) {
    case 'MILESTONE':
      // Parse as 0 or 1
      return parseInt(currentValue) === 1 ? 1 : 0;

    case 'COUNT':
      // Parse as integer
      return parseInt(currentValue) || 0;

    case 'PERCENTAGE':
    case 'FINANCIAL':
      // Parse as decimal
      return parseFloat(currentValue) || 0;

    case 'TEXT_CONDITION':
      // Return as string
      return currentValue;

    default:
      return parseFloat(currentValue) || 0;
  }
}

/**
 * Formats current_value for storage in database (always stores as string)
 */
export function formatCurrentValueForDB(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

/**
 * Calculates achievement based on target type
 */
export function calculateAchievement(
  currentValue: number | string,
  targetValue: number | string,
  targetType: TargetType
): number {
  switch (targetType) {
    case 'MILESTONE':
      // Binary: 0% or 100%
      return currentValue === 1 || currentValue === '1' ? 100 : 0;

    case 'TEXT_CONDITION':
      // Qualitative mapping
      if (currentValue === 'Met') return 100;
      if (currentValue === 'In Progress') return 50;
      return 0; // Not Met

    case 'COUNT':
    case 'PERCENTAGE':
    case 'FINANCIAL':
      // Numeric calculation
      const current = typeof currentValue === 'string' ? parseFloat(currentValue.replace(/,/g, '')) : currentValue;
      const target = typeof targetValue === 'string' ? parseFloat(targetValue.replace(/,/g, '')) : targetValue;
      
      if (!target || target === 0) return 0;
      return (current / target) * 100;

    default:
      return 0;
  }
}

/**
 * Determines status based on achievement percentage and target type
 */
export function determineStatus(
  achievementPercent: number,
  targetType: TargetType,
  currentValue?: number | string
): 'MET' | 'ON_TRACK' | 'MISSED' | 'PENDING' {
  // Special handling for text conditions
  if (targetType === 'TEXT_CONDITION') {
    if (currentValue === 'Met') return 'MET';
    if (currentValue === 'In Progress') return 'ON_TRACK';
    if (currentValue === 'Not Met') return 'MISSED';
    return 'PENDING';
  }

  // Milestone: only MET or PENDING
  if (targetType === 'MILESTONE') {
    return achievementPercent === 100 ? 'MET' : 'PENDING';
  }

  // Numeric thresholds
  if (achievementPercent >= 100) return 'MET';
  if (achievementPercent >= 80) return 'ON_TRACK';
  if (achievementPercent > 0) return 'MISSED';
  return 'PENDING';
}
