export function summarizeCalories(consumed: number, goal: number) {
  const difference = goal - consumed;
  return {
    difference,
    percentage: Math.round(100 * consumed / goal),
    fill: Math.min(100, 100 * consumed / goal),
    status: difference < 0 ? 'over' : difference === 0 ? 'reached' : 'left',
  } as const;
}
