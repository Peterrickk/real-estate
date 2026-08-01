import type { LatLng } from '../mapUtils';

/**
 * PhilSA / CopPhil Sentinel-1 flood-mapping integration point.
 *
 * Background (from the PhilSA knowledge base):
 *   https://knowledgebase.infra.copphil.philsa.gov.ph/en/latest/monitoring/Sentinel-1-SAR-for-Flood-Mapping-in-the-Philippines-on-CopPhil.html
 *
 * CopPhil hosts the Sentinel-1 archive on an S3-compatible bucket (`/eodata`)
 * and exposes discovery through an OData catalogue. Flood extent is derived by:
 *   1. Searching GRD-COG / IW products over an AOI before and after an event.
 *   2. Reading the VV and VH bands, converting them to dB.
 *   3. Thresholding each band (VV ≈ 21.5–23 dB, VH ≈ 17.5–18 dB) and AND-ing
 *      the results to flag water.
 *   4. Differencing pre/post-event rasters to isolate flood-inundated land.
 *
 * This module can run in Node/Python with CopPhil credentials, but NOT in the
 * browser (S3 + rasterio processing). We therefore ship the exact query builder
 * and thresholds here so the app is ready to consume flood maps the moment a
 * backend proxy is added. The map UI shows these as the "Satellite flood
 * mapping" source.
 */

export const COP_PHIL_CATALOGUE_URL =
  import.meta.env.VITE_PHILSA_COP_PHIL_CATALOGUE ??
  'https://catalogue.infra.copphil.philsa.gov.ph/odata/v1';
export const COP_PHIL_S3_HOST =
  import.meta.env.VITE_PHILSA_COP_PHIL_S3 ?? 'https://eodata.infra.copphil.philsa.gov.ph/';
export const COP_PHIL_KB_URL =
  'https://knowledgebase.infra.copphil.philsa.gov.ph/en/latest/monitoring/Sentinel-1-SAR-for-Flood-Mapping-in-the-Philippines-on-CopPhil.html';

export const SENTINEL_1_COLLECTION = 'SENTINEL-1';
export const SENTINEL_1_PRODUCT_TYPE = 'GRD-COG';
export const SENTINEL_1_MODE = 'IW';

/** Sentinel-1 VV/VH backscatter thresholds (dB) used to flag water, per PhilSA. */
export function sentinelFloodThresholds(): { vv: number; vh: number } {
  return { vv: 21.5, vh: 18 };
}

/** Short pipeline summary shown in the UI. */
export function describeSentinelFloodPipeline(): string[] {
  return [
    'Discover Sentinel-1 GRD-COG / IW products over the AOI (pre- and post-event).',
    'Extract VV + VH bands and convert to dB.',
    'Threshold both bands (VV ≈ 21.5 dB, VH ≈ 18 dB) and AND the results to flag water.',
    'Difference the pre/post rasters to map newly flooded land.',
  ];
}

/** Build a WKT bounding polygon around a point for the AOI search. */
export function aoiAroundPoint(point: LatLng, radiusDeg = 0.15): string {
  const south = point.lat - radiusDeg;
  const north = point.lat + radiusDeg;
  const west = point.lng - radiusDeg;
  const east = point.lng + radiusDeg;
  return `POLYGON((${west} ${south}, ${east} ${south}, ${east} ${north}, ${west} ${north}, ${west} ${south}))`;
}

export interface CopPhilFloodSearch {
  /** URL-safe OData query ready to paste into a browser or curl. */
  queryUrl: string;
  /** Raw OData filter string for programmatic use. */
  filter: string;
  /** WKT AOI used for the search. */
  aoiWkt: string;
}

/** Build the CopPhil OData flood search for an AOI + time window. */
export function buildCopPhilFloodQuery(
  aoiWkt: string,
  start: string,
  end: string,
  top = 100,
): CopPhilFloodSearch {
  const filter =
    `Collection/Name eq '${SENTINEL_1_COLLECTION}' ` +
    `and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' ` +
    `and att/OData.CSC.StringAttribute/Value eq '${SENTINEL_1_PRODUCT_TYPE}') ` +
    `and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'operationalMode' ` +
    `and att/OData.CSC.StringAttribute/Value eq '${SENTINEL_1_MODE}') ` +
    `and OData.CSC.Intersects(area=geography'SRID=4326;${aoiWkt}') ` +
    `and ContentDate/Start gt ${start} ` +
    `and ContentDate/Start lt ${end}`;

  return {
    queryUrl: `${COP_PHIL_CATALOGUE_URL}/Products?$filter=${encodeURIComponent(filter)}&$top=${top}`,
    filter,
    aoiWkt,
  };
}
