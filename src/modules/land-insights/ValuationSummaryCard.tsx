import type { ValuationSummary } from './types';

interface ValuationSummaryCardProps {
  summary: ValuationSummary;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function ValuationSummaryCard({ summary }: ValuationSummaryCardProps) {
  const changeClass = summary.priceChangeSinceLastSale >= 0 ? 'stat-positive' : 'stat-negative';

  return (
    <article className="card valuation-card">
      <h3>Valuation Summary</h3>
      <dl className="stat-grid">
        <div>
          <dt>Current estimated value</dt>
          <dd className="stat-value">{formatPrice(summary.currentEstimatedValue)}</dd>
        </div>
        <div>
          <dt>Change since last sale</dt>
          <dd className={`stat-value ${changeClass}`}>
            {summary.priceChangeSinceLastSale >= 0 ? '+' : ''}
            {formatPrice(summary.priceChangeSinceLastSale)} ({summary.priceChangePercent}%)
          </dd>
        </div>
        <div>
          <dt>Comparable land average</dt>
          <dd className="stat-value">{formatPrice(summary.comparableLandAverage)}</dd>
        </div>
        <div>
          <dt>Last sale</dt>
          <dd>
            {formatPrice(summary.lastSalePrice)} on {summary.lastSaleDate}
          </dd>
        </div>
      </dl>
    </article>
  );
}
