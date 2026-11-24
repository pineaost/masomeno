import { calendarDate } from '@/lib/dates';

export type ChartPoint = { day: string; value: number };

export function LineChart({
  data,
  label,
  compact = false,
}: {
  data: ChartPoint[];
  label: string;
  compact?: boolean;
}) {
  const width = 640;
  const height = compact ? 83 : 220;
  const inset = 9;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min;
  const first = calendarDate(data[0].day).valueOf();
  const last = calendarDate(data[data.length - 1].day).valueOf();
  const points = data.map(({ day, value }, index) => {
    const position = first === last ? index / (data.length - 1) : (calendarDate(day).valueOf() - first) / (last - first);
    return {
      x: inset + position * (width - 2 * inset),
      y: inset + (range ? 1 - (value - min) / range : 0.5) * (height - 2 * inset),
    };
  });
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const endpoint = points[points.length - 1];

  return (
    <svg className={compact ? 'trend-chart compact' : 'trend-chart'} role="img" aria-label={label}
      viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[inset, height / 2, height - inset].map((y) => (
        <line className="chart-grid" key={y} x1="0" x2={width} y1={y} y2={y} />
      ))}
      <polygon className="chart-area" points={`${points[0].x},${height} ${line} ${endpoint.x},${height}`} />
      <polyline className="chart-line" points={line} />
      <line className="chart-endpoint" x1={endpoint.x} x2={endpoint.x} y1={endpoint.y} y2={endpoint.y} />
    </svg>
  );
}
