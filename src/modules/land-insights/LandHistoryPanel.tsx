import type { Property } from '../property-registry/types';
import type { EarthquakeEvent, PropertyHazardAssessment } from '../../lib/hazards/types';
import { aoiAroundPoint, buildCopPhilFloodQuery, COP_PHIL_KB_URL } from '../../lib/hazards/philsaSentinel';
import { RISK_LABEL } from '../../lib/valuation/riskAdjustedValuation';

interface LandHistoryPanelProps {
  property: Property | null;
  assessment: PropertyHazardAssessment | null;
  /** Earthquakes near the selected property (already filtered). */
  nearbyEarthquakes: Array<EarthquakeEvent & { distanceKm: number }>;
  activeSignals: Record<string, boolean>;
  onToggleSignal: (propertyId: string, label: string) => void;
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

function formatKm(distanceKm: number | null): string {
  return distanceKm === null ? '—' : `${distanceKm.toFixed(0)} km`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** PhilSA OData search window (rolling 30 days), computed once at load. */
const PHILSA_SEARCH_WINDOW = (() => {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
})();

export function LandHistoryPanel({
  property,
  assessment,
  nearbyEarthquakes,
  activeSignals,
  onToggleSignal,
  lastUpdated,
  loading,
  onRefresh,
}: LandHistoryPanelProps) {
  if (!property || !assessment) {
    return (
      <article className="card land-history">
        <h3>Land History &amp; Hazard</h3>
        <p className="empty-state">Select a tokenized property to view its land history.</p>
      </article>
    );
  }

  const recentEvents = nearbyEarthquakes.slice(0, 5);
  const aoi = aoiAroundPoint(property);
  const philsaSearch = buildCopPhilFloodQuery(
    aoi,
    PHILSA_SEARCH_WINDOW.start,
    PHILSA_SEARCH_WINDOW.end,
  );
  const developmentSignals = assessment.development;

  const riskBadge = (level: PropertyHazardAssessment['overall']) =>
    `risk-badge risk-badge--${level}`;

  return (
    <article className="card land-history">
      <div className="land-history__header">
        <h3>Land History &amp; Hazard</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh live data'}
        </button>
      </div>

      {lastUpdated && (
        <p className="land-history__meta">
          Live readings updated {lastUpdated.toLocaleTimeString()}.
        </p>
      )}

      <section className="land-history__section">
        <div className="land-history__section-title">
          <h4>Seismic history</h4>
          <span className={riskBadge(assessment.seismic.risk)}>
            {RISK_LABEL[assessment.seismic.risk]}
          </span>
        </div>
        {assessment.seismic.recentEvents === 0 ? (
          <p className="land-history__hint">
            No earthquakes recorded within 200 km in the last 30 days
            {assessment.seismic.risk !== 'low' ? ' (regional baseline applies)' : ''}.
          </p>
        ) : (
          <>
            <p className="land-history__summary">
              {assessment.seismic.recentEvents} quakes within 200 km — strongest M
              {assessment.seismic.maxMagnitude.toFixed(1)}, nearest{' '}
              {formatKm(assessment.seismic.nearestKm)}.
            </p>
            <ul className="land-history__list">
              {recentEvents.map((event) => (
                <li key={event.id} className="land-history__item">
                  <span className="land-history__item-main">
                    <strong>M{event.magnitude.toFixed(1)}</strong> {event.place}
                  </span>
                  <span className="land-history__item-meta">
                    {formatDate(event.time)} ·{' '}
                    {event.depthKm.toFixed(0)} km deep ·{' '}
                    {formatKm(event.distanceKm)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="land-history__section">
        <div className="land-history__section-title">
          <h4>Flood proneness</h4>
          <span className={riskBadge(assessment.flood.risk)}>
            {RISK_LABEL[assessment.flood.risk]}
          </span>
        </div>
        <p className="land-history__summary">
          {assessment.flood.zone} · {assessment.flood.drivingFactor}.
        </p>
        <details className="philsa-details">
          <summary>Satellite flood mapping (PhilSA / CopPhil)</summary>
          <p className="land-history__hint">
            Live flood extents come from Sentinel-1 SAR via the Philippine Space
            Agency (PhilSA) CopPhil platform: VV/VH backscatter is thresholded and
            pre/post-event rasters are differenced. The query below is the exact
            CopPhil OData search for this property's area of interest.
          </p>
          <code className="philsa-query">{philsaSearch.queryUrl}</code>
          <p className="land-history__hint">
            Full pipeline: <a href={COP_PHIL_KB_URL} target="_blank" rel="noreferrer">
              PhilSA Sentinel-1 flood-mapping notebook
            </a>
            .
          </p>
        </details>
      </section>

      <section className="land-history__section">
        <div className="land-history__section-title">
          <h4>Terrain quality</h4>
          <span className={riskBadge(assessment.terrain.relief)}>
            {RISK_LABEL[assessment.terrain.relief]}
          </span>
        </div>
        <p className="land-history__summary">
          {assessment.terrain.label} · {Math.round(assessment.elevationM)} m elevation (SRTM).
        </p>
      </section>

      <section className="land-history__section">
        <div className="land-history__section-title">
          <h4>Nearby development</h4>
        </div>
        {developmentSignals.length === 0 ? (
          <p className="land-history__hint">
            No development signals tracked for this property.
          </p>
        ) : (
          <div className="checkbox-list">
            {developmentSignals.map((signal) => {
              const checked = activeSignals[`${property.id}:${signal.label}`] ?? true;
              return (
                <label key={signal.label} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleSignal(property.id, signal.label)}
                  />
                  <span>
                    <strong>{signal.label}</strong>
                    {signal.distanceKm !== undefined && ` · ${signal.distanceKm.toFixed(1)} km`}
                    {signal.note ? ` — ${signal.note}` : ''}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}
