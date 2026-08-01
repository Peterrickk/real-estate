interface ResultMapItem {
  id: string;
  title: string;
  subtitle?: string;
  highlighted?: boolean;
}

interface ResultMapProps {
  title: string;
  description?: string;
  items: ResultMapItem[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getPinPosition(index: number, total: number): { left: string; top: string } {
  const columns = total > 3 ? 3 : 2;
  const row = Math.floor(index / columns);
  const col = index % columns;
  const left = clamp(18 + col * 27 + (row % 2) * 4, 12, 84);
  const top = clamp(18 + row * 23, 12, 80);
  return { left: `${left}%`, top: `${top}%` };
}

export function ResultMap({ title, description, items }: ResultMapProps) {
  return (
    <section className="result-map card">
      <div className="result-map__header">
        <div>
          <p className="result-map__eyebrow">Live map</p>
          <h3>{title}</h3>
        </div>
        {description && <p className="result-map__description">{description}</p>}
      </div>

      <div className="result-map__canvas" aria-label={`${title} map`}>
        <div className="result-map__terrain" aria-hidden="true" />
        {items.map((item, index) => {
          const position = getPinPosition(index, items.length || 1);

          return (
            <button
              key={item.id}
              type="button"
              className={item.highlighted ? 'result-map__pin is-active' : 'result-map__pin'}
              style={{ left: position.left, top: position.top }}
              title={item.title}
              aria-label={item.title}
            >
              <span className="result-map__dot" aria-hidden="true" />
              <span className="result-map__label">{item.subtitle ?? item.title}</span>
            </button>
          );
        })}
        {items.length === 0 && <p className="empty-state result-map__empty">No visible results for the current filters.</p>}
      </div>
    </section>
  );
}