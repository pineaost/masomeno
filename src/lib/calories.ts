const tolerance = 100;

export function calorieProgress(consumed: number, goal: number | null) {
  if (goal === null || !Number.isFinite(goal) || goal <= 0 || !Number.isFinite(consumed) || consumed < 0) return null;

  const lower = Math.max(0, goal - tolerance);
  const upper = goal + tolerance;
  // Small goals need extra room for the full target zone and the excess segment.
  const scale = Math.max(goal * 1.25, upper + 25);
  const percentage = (consumed / goal) * 100;
  if (!Number.isFinite(scale) || !Number.isFinite(percentage)) return null;

  const visible = Math.min(consumed, scale);
  const width = (kcal: number) => (kcal / scale) * 100;
  return {
    lower, upper, scale, visible, percentage,
    status: consumed < lower ? 'belowRange' : consumed > upper ? 'aboveRange' : 'withinRange',
    distanceToRange: Math.max(0, lower - consumed, consumed - upper),
    goalMark: width(goal),
    baseFill: width(Math.min(visible, lower)),
    zoneStart: width(lower),
    zoneWidth: width(upper - lower),
    zoneFill: ((Math.min(upper, Math.max(lower, visible)) - lower) / (upper - lower)) * 100,
    excessStart: width(upper),
    excessFill: width(Math.max(0, visible - upper)),
  } as const;
}
