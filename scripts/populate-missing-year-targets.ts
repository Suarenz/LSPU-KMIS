/**
 * Populate Missing Year Targets
 * 
 * This script adds missing year targets (2025-2029) to KPIs that only have 
 * some years defined (typically only 2029).
 * 
 * Run with: npx tsx scripts/populate-missing-year-targets.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const strategicPlanPath = path.join(__dirname, '../lib/data/strategic_plan.json');
const strategicPlan = JSON.parse(fs.readFileSync(strategicPlanPath, 'utf-8'));

// Years we want data for
const allYears = [2025, 2026, 2027, 2028, 2029];

// Function to generate progressive values based on target type and final value
function generateProgressiveValues(
  finalValue: number | string,
  targetType: string,
  existingData: { year: number; target_value: any }[]
): { year: number; target_value: any; note?: string }[] {
  const result: { year: number; target_value: any; note?: string }[] = [];
  
  // Create a map of existing values
  const existingMap = new Map<number, any>();
  existingData.forEach(d => existingMap.set(d.year, d.target_value));
  
  // Get the final 2029 value or the max year value
  const maxYear = Math.max(...existingData.map(d => d.year));
  const maxValue = existingMap.get(maxYear);
  
  for (const year of allYears) {
    if (existingMap.has(year)) {
      // Keep existing value
      const existing = existingData.find(d => d.year === year);
      result.push(existing!);
    } else {
      // Generate value based on type
      if (targetType === 'milestone') {
        // For milestones, use placeholder text
        const milestoneLabels: { [key: number]: string } = {
          2025: 'Planning Phase',
          2026: 'Development Phase',
          2027: 'Implementation Phase',
          2028: 'Evaluation Phase',
          2029: String(maxValue) || 'Completion'
        };
        result.push({
          year,
          target_value: milestoneLabels[year] || 'In Progress'
        });
      } else if (targetType === 'text_condition') {
        // For text conditions, repeat the condition or use "Ongoing"
        result.push({
          year,
          target_value: String(maxValue) || 'Ongoing'
        });
      } else if (targetType === 'percentage') {
        // For percentages, create progressive values towards 100 or final value
        const final = typeof maxValue === 'number' ? maxValue : parseFloat(String(maxValue)) || 100;
        // Calculate progressive: start at 60% of target and increase
        const yearIndex = year - 2025;
        const progression = [0.6, 0.7, 0.8, 0.9, 1.0];
        const value = Math.round(final * progression[yearIndex]);
        result.push({ year, target_value: value });
      } else if (targetType === 'count') {
        // For counts, create increasing values
        const final = typeof maxValue === 'number' ? maxValue : parseFloat(String(maxValue)) || 1;
        // If final is small (1-5), use same value each year
        if (final <= 5) {
          result.push({ year, target_value: final });
        } else {
          // Calculate progressive: start lower and increase to final
          const yearIndex = year - 2025;
          const progression = [0.6, 0.7, 0.8, 0.9, 1.0];
          const value = Math.round(final * progression[yearIndex]);
          result.push({ year, target_value: Math.max(1, value) });
        }
      } else if (targetType === 'financial') {
        // For financial, create increasing values
        const final = typeof maxValue === 'number' ? maxValue : parseFloat(String(maxValue)) || 0;
        const yearIndex = year - 2025;
        const progression = [0.6, 0.7, 0.8, 0.9, 1.0];
        const value = Math.round(final * progression[yearIndex]);
        result.push({ year, target_value: value });
      } else {
        // Default: use the final value
        result.push({ year, target_value: maxValue || 0 });
      }
    }
  }
  
  // Sort by year
  result.sort((a, b) => a.year - b.year);
  return result;
}

// Track changes
let changesCount = 0;
const changedKpis: string[] = [];

// Process all KRAs
for (const kra of strategicPlan.kras) {
  for (const initiative of kra.initiatives || []) {
    const timelineData = initiative.targets?.timeline_data || [];
    const existingYears = timelineData.map((t: any) => t.year);
    const missingYears = allYears.filter(y => !existingYears.includes(y));
    
    if (missingYears.length > 0) {
      console.log(`\n${initiative.id}: Missing years ${missingYears.join(', ')}`);
      console.log(`  Current: ${timelineData.map((t: any) => `${t.year}=${t.target_value}`).join(', ')}`);
      
      // Generate complete timeline
      const newTimeline = generateProgressiveValues(
        timelineData[timelineData.length - 1]?.target_value,
        initiative.targets?.type || 'count',
        timelineData
      );
      
      console.log(`  New:     ${newTimeline.map((t: any) => `${t.year}=${t.target_value}`).join(', ')}`);
      
      // Update the initiative
      initiative.targets.timeline_data = newTimeline;
      changesCount++;
      changedKpis.push(initiative.id);
    }
  }
}

// Write updated file
if (changesCount > 0) {
  fs.writeFileSync(strategicPlanPath, JSON.stringify(strategicPlan, null, 2) + '\n');
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Updated ${changesCount} KPIs with missing year targets`);
  console.log(`Changed KPIs: ${changedKpis.join(', ')}`);
  console.log(`${'='.repeat(60)}`);
} else {
  console.log('\n✅ All KPIs already have complete year data (2025-2029)');
}
