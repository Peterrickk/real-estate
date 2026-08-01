import { useAppData } from '../../context/AppDataContext';
import { PropertyCard } from './PropertyCard';

export function PropertyRegistryPage() {
  const { data } = useAppData();

  return (
    <section className="page">
      <header className="page-header">
        <h1>Property Registry</h1>
        <p>On-chain representation of tokenized real estate assets.</p>
      </header>
      <div className="card-grid">
        {data.properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
