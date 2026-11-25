export function summarizeCalories(consumed: number, goal: number) {
  const difference = goal - consumed;
  const scale = Math.max(goal, consumed);
  return {
    difference,
    percentage: 100 * consumed / goal,
    goalMark: 100 * goal / scale,
    baseFill: 100 * Math.min(consumed, goal) / scale,
    excessFill: 100 * Math.max(0, consumed - goal) / scale,
    status: difference < 0 ? 'over' : difference === 0 ? 'reached' : 'left',
  } as const;
}
