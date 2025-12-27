import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const strategicPlanPath = path.join(__dirname, '../lib/data/strategic_plan.json');
const strategicPlanData = JSON.parse(fs.readFileSync(strategicPlanPath, 'utf-8'));
const strategicPlan = strategicPlanData;

interface ValidationResult {
  id: string;
  isValid: boolean;
  errors: string[];
  targetType: string | null;
  targetValues: (string | number)[];
}

const results: ValidationResult[] = [];

for (const kra of strategicPlan.kras) {
  for (const initiative of kra.initiatives || []) {
    const result: ValidationResult = {
      id: initiative.id,
      isValid: true,
      errors: [],
      targetType: initiative.targets?.type || null,
      targetValues: [],
    };

    // Check if targets exist
    if (!initiative.targets) {
      result.isValid = false;
      result.errors.push('No targets section defined');
    } else {
      // Check if timeline_data exists
      if (!Array.isArray(initiative.targets.timeline_data) || initiative.targets.timeline_data.length === 0) {
        result.isValid = false;
        result.errors.push('timeline_data is missing or empty');
      } else {
        // Extract all target values
        result.targetValues = initiative.targets.timeline_data.map(t => t.target_value);

        // Check if all target values are present
        for (const timelineItem of initiative.targets.timeline_data) {
          if (timelineItem.target_value === null || timelineItem.target_value === undefined) {
            result.isValid = false;
            result.errors.push(`Year ${timelineItem.year}: target_value is null or undefined`);
          }
        }
      }
    }

    results.push(result);
  }
}

// Print validation results
console.log('\n=== STRATEGIC PLAN VALIDATION REPORT ===\n');
console.log(`Total initiatives: ${results.length}`);

const invalid = results.filter(r => !r.isValid);
console.log(`Invalid/incomplete initiatives: ${invalid.length}\n`);

if (invalid.length > 0) {
  console.log('=== INVALID INITIATIVES ===');
  for (const result of invalid) {
    console.log(`\n${result.id} (${result.targetType}):`);
    for (const error of result.errors) {
      console.log(`  ❌ ${error}`);
    }
  }
}

// Show initiatives with unusual target values
console.log('\n=== INITIATIVES WITH ZERO OR VERY LOW TARGETS ===');
for (const result of results) {
  const hasZero = result.targetValues.some(v => v === 0 || v === '0');
  if (hasZero && result.targetType === 'count') {
    console.log(`${result.id}: ${result.targetValues.join(', ')}`);
  }
}

// Summary
console.log('\n=== SUMMARY ===');
const validCount = results.filter(r => r.isValid).length;
console.log(`✅ Valid initiatives: ${validCount}/${results.length}`);

if (validCount === results.length) {
  console.log('\n✨ All initiatives are valid!');
  process.exit(0);
} else {
  console.log('\n⚠️ Some initiatives need attention');
  process.exit(1);
}
