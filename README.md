# BCH Real Estate

Tokenized real estate demo on Bitcoin Cash — property registry, marketplace escrow, ownership history, and land insights.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

Copy `.env.example` to `.env.local` (gitignored) and fill in values locally.

| Variable | Required | Description |
|---|---|---|
| `VITE_BCH_NETWORK` | No | `mainnet`, `testnet`, or `chipnet` (default: `chipnet`) |
| `VITE_GOOGLE_MAPS_API_KEY` | For maps | Google Maps JavaScript API key |

### Google Maps API key

Maps and location autocomplete require a Google Cloud API key with these APIs enabled:

1. **Maps JavaScript API**
2. **Places API**

Steps:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Places API
3. Create an API key under **APIs & Services → Credentials**
4. Add the key to `.env.local`:

   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

5. **Restrict the key before production:**
   - Application restriction: **HTTP referrers**
   - Add your dev origin (e.g. `http://localhost:5173/*`) and production domain
   - API restriction: limit to Maps JavaScript API + Places API only

Without a key, map panels show a **“Google Maps API key missing”** placeholder and location autocomplete inputs are disabled.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run compile:contract` | Compile `contracts/PropertySaleEscrow.cash` → `artifacts/` |
| `npm run lint` | ESLint |

## Project structure

```
contracts/          CashScript .cash sources
artifacts/          Compiled contract JSON
src/
  components/       PropertyMap, LocationAutocomplete, layout
  lib/googleMaps.ts Shared Maps loader config + geo helpers
  modules/          Feature pages (registry, marketplace, history, insights)
  data/             Mock property data (source of truth for now)
```

Mock data includes `lat`/`lng` for Miami, Austin, Phoenix, and Denver properties. No live property database yet.

## CashScript

Escrow contract: `contracts/PropertySaleEscrow.cash` — 3-party payment escrow (buyer, seller, title company arbiter). Property token minting is separate from escrow payment release.
