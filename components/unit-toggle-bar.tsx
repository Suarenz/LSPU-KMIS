/**
 * Unit Toggle Bar Component
 *
 * A React component that provides a toggleable section with animated content.
 * Features:
 * - Accessible with keyboard navigation (Enter/Space toggle)
 * - Smooth transition animations
 * - Theme-consistent styling using shadcn/ui components
 * - Proper ARIA attributes for accessibility
 * - Responsive design
 * - Customizable through props
 *
 * Usage:
 * ```tsx
 * <UnitToggleBar
 *   label="Units Section"
 *   defaultExpanded={true}
 *   onToggle={(expanded) => console.log('Toggle state:', expanded)}
 * >
 *   <div>Content to show/hide</div>
 * </UnitToggleBar>
 * ```
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface UnitToggleBarProps {
  /**
   * Callback function triggered when the toggle state changes
   */
  onToggle?: (isExpanded: boolean) => void;
  
  /**
   * Initial state of the toggle - whether the content is expanded or collapsed
   * @default true
   */
  defaultExpanded?: boolean;
  
  /**
   * Label for the toggle button
   * @default "Units"
   */
  label?: string;
  
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  
  /**
   * Content to be shown/hidden when toggled
   */
  children?: React.ReactNode;
  
  /**
   * Whether to animate the content transition
   * @default true
   */
  animated?: boolean;
}

const UnitToggleBar: React.FC<UnitToggleBarProps> = ({
  onToggle,
  defaultExpanded = true,
  label = 'Units',
  className = '',
  children,
  animated = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);

  // Notify parent component when expanded state changes
  useEffect(() => {
    onToggle?.(isExpanded);
 }, [isExpanded, onToggle]);

  // Toggle the expanded state
  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`w-full transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between w-full p-3 bg-muted rounded-lg border">
        <Button
          variant="ghost"
          className="flex items-center justify-between w-full text-left font-medium hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:rounded-md"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-controls="units-content"
          id="units-toggle"
        >
          <span className="text-lg font-semibold">{label}</span>
          {isExpanded ? (
            <ChevronUp
              className="h-5 w-5 text-primary transition-transform duration-300"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="h-5 w-5 text-primary transition-transform duration-300"
              aria-hidden="true"
            />
          )}
        </Button>
      </div>
      
      <div
        id="units-content"
        role="region"
        aria-labelledby="units-toggle"
        ref={contentRef}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded
            ? (animated ? 'max-h-[1000px] opacity-100' : 'max-h-none opacity-100')
            : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 border-l border-r border-b rounded-b-lg bg-background">
          {children}
        </div>
      </div>
    </div>
  );
};

export { UnitToggleBar };