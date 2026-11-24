export type ChartPoint = { day: string; value: number; trend?: number };

export function chartBounds(data: ChartPoint[]) {
  return data.reduce(({ min, max }, { value, trend = value }) => ({
    min: Math.min(min, value, trend),
    max: Math.max(max, value, trend),
  }), { min: data[0].value, max: data[0].value });
}

export function LineChart({
  data,
  label,
  compact = false,
}: {
  data: ChartPoint[];
  label: string;
  compact?: boolean;
}) {
  if (data.length < 2) return null;

  const width = 640;
  const height = compact ? 83 : 220;
  const inset = 9;
  const { min, max } = chartBounds(data);
  const range = max - min;
  const first = Date.parse(data[0].day);
  const last = Date.parse(data[data.length - 1].day);
  const yForValue = (value: number) => inset + (range ? 1 - (value - min) / range : 0.5) * (height - 2 * inset);
  const points = data.map(({ day, value }, index) => {
    const position = first === last ? index / (data.length - 1) : (Date.parse(day) - first) / (last - first);
    return {
      x: inset + position * (width - 2 * inset),
      y: yForValue(value),
    };
  });
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const trend = data.flatMap((point, index) =>
    point.trend === undefined ? [] : [`${points[index].x},${yForValue(point.trend)}`]);
  const endpoint = points[points.length - 1];

  return (
    <svg className={compact ? 'trend-chart compact' : 'trend-chart'} role="img" aria-label={label}
      viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[inset, height / 2, height - inset].map((y) => (
        <line className="chart-grid" key={y} x1="0" x2={width} y1={y} y2={y} />
      ))}
      <polygon className="chart-area" points={`${points[0].x},${height} ${line} ${endpoint.x},${height}`} />
      <polyline className="chart-line" points={line} />
      {!compact && points.length <= 60 && points.map(({ x, y }, index) => (
        <line className="chart-observation" key={index} x1={x} x2={x} y1={y} y2={y} />
      ))}
      {trend.length >= 2 && <polyline className="chart-trend" points={trend.join(' ')} />}
      <line className="chart-endpoint" x1={endpoint.x} x2={endpoint.x} y1={endpoint.y} y2={endpoint.y} />
    </svg>
  );
}
