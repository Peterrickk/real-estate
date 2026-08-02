export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function truncatePubkey(pubkey: string): string {
  return `${pubkey.slice(0, 8)}…${pubkey.slice(-6)}`;
}

const PROPERTY_IMAGES = [
  '/realestate1.jpg',
  '/realestate2.jpeg',
  '/realestate3.webp',
  '/realestate4.jpg',
  '/realestate6.jpeg',
  '/realestate7.jpg',
];

/** Deterministically picks a stock photo for a property based on its id. */
export function getPropertyImage(propertyId: string): string {
  const seed = Math.abs(
    propertyId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0),
  );
  return PROPERTY_IMAGES[seed % PROPERTY_IMAGES.length];
}