export type ChartPoint = { day: string; value: number; trend?: number };

export function chartBounds(data: ChartPoint[], padding?: number) {
  const { min, max } = data.reduce(({ min, max }, { value, trend = value }) => ({
    min: Math.min(min, value, trend),
    max: Math.max(max, value, trend),
  }), { min: data[0]?.value ?? 0, max: data[0]?.value ?? 0 });
  const margin = padding ?? Math.max((max - min) * 0.2, Math.max(Math.abs(max), Math.abs(min)) * 0.05, 0.1);
  return { min: padding === undefined && min >= 0 ? Math.max(0, min - margin) : min - margin, max: max + margin };
}

export function trendSegments(data: ChartPoint[]) {
  const segments: number[][] = [];
  let current: number[] = [];
  for (const [index, point] of data.entries()) {
    if (point.trend === undefined) {
      if (current.length >= 2) segments.push(current);
      current = [];
    } else current.push(index);
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}
