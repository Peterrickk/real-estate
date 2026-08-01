import { useMemo } from 'react';
import type { PropertyHazardAssessment } from '../../lib/hazards/types';
import { computeRiskAdjustedValuation } from '../../lib/valuation/riskAdjustedValuation';

interface RiskAdjustedValuationCardProps {
  baseValue: number;
  assessment: PropertyHazardAssessment | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${(percent * 100).toFixed(1)}%`;
}

export function RiskAdjustedValuationCard({
  baseValue,
  assessment,
}: RiskAdjustedValuationCardProps) {
  const valuation = useMemo(
    () => (assessment ? computeRiskAdjustedValuation({ baseValue, assessment }) : null),
    [baseValue, assessment],
  );

  if (!valuation) {
    return (
      <article className="card valuation-card">
        <h3>Risk-Adjusted Value</h3>
        <p className="empty-state">No hazard assessment available for this property.</p>
      </article>
    );
  }

  return (
    <article className="card valuation-card risk-value-card">
      <h3>Risk-Adjusted Value</h3>
      <dl className="stat-grid">
        <div>
          <dt>Base value</dt>
          <dd className="stat-value">{formatPrice(valuation.baseValue)}</dd>
        </div>
        <div>
          <dt>Adjusted value</dt>
          <dd
            className={`stat-value ${
              valuation.totalPercent >= 0 ? 'stat-positive' : 'stat-negative'
            }`}
          >
            {formatPrice(valuation.adjustedValue)}
          </dd>
        </div>
        <div>
          <dt>Total adjustment</dt>
          <dd
            className={`stat-value ${
              valuation.totalPercent >= 0 ? 'stat-positive' : 'stat-negative'
            }`}
          >
            {formatPercent(valuation.totalPercent)}
          </dd>
        </div>
      </dl>

      <div className="risk-breakdown">
        {valuation.rows.map((row) => (
          <div key={row.key} className="risk-breakdown__row">
            <span className="risk-breakdown__label">
              {row.label}
              <span className="risk-breakdown__detail">{row.detail}</span>
            </span>
            <span
              className={`risk-breakdown__delta ${
                row.percent >= 0 ? 'stat-positive' : 'stat-negative'
              }`}
            >
              {formatPrice(row.delta)} ({formatPercent(row.percent)})
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
