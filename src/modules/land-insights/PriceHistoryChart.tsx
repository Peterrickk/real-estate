import type { PriceHistoryPoint } from './types';

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`;
  return `$${price}`;
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  if (data.length === 0) {
    return <p className="empty-state">No price history available.</p>;
  }

  const maxPrice = Math.max(...data.map((d) => d.price));
  const minPrice = Math.min(...data.map((d) => d.price));
  const range = maxPrice - minPrice || 1;

  return (
    <div className="chart">
      <div className="chart-bars">
        {data.map((point) => {
          const height = ((point.price - minPrice) / range) * 70 + 30;
          return (
            <div key={point.date} className="chart-bar-group">
              <span className="chart-value">{formatPrice(point.price)}</span>
              <div className="chart-bar" style={{ height: `${height}%` }} />
              <span className="chart-label">{point.date.slice(0, 7)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
