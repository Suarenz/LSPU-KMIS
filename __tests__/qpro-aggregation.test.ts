import { computeAggregatedAchievement } from '@/lib/utils/qpro-aggregation';

describe('qpro-aggregation.computeAggregatedAchievement', () => {
  test('percentage: averages valid percent values', () => {
    const result = computeAggregatedAchievement({
      targetType: 'percentage',
      targetValue: 73,
      activities: [{ reported: 70 }, { reported: 80 }],
    });

    expect(result.totalReported).toBe(75);
    expect(result.totalTarget).toBe(73);
    expect(result.achievementPercent).toBeCloseTo((75 / 73) * 100, 6);
  });

  test('percentage: converts count/denominator pairs to percent', () => {
    const result = computeAggregatedAchievement({
      targetType: 'percentage',
      targetValue: 73,
      activities: [
        { reported: 154, target: 200 }, // 77%
        { reported: 160, target: 200 }, // 80%
      ],
    });

    expect(result.totalReported).toBeCloseTo(78.5, 6);
    expect(result.achievementPercent).toBeCloseTo((78.5 / 73) * 100, 6);
  });

  test('percentage: ignores invalid >100 values without denominator', () => {
    const result = computeAggregatedAchievement({
      targetType: 'percentage',
      targetValue: 73,
      activities: [{ reported: 154 }],
    });

    expect(result.totalReported).toBe(0);
    expect(result.achievementPercent).toBe(0);
  });
});
